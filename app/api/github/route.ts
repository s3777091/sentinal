import axios from "axios";
import { NextResponse } from "next/server";
import { z } from "zod";
import { extractFunctionsAndClasses } from "@/lib/action/github.action";
import { CyberSend } from "@dad1909/cyber";

const psw: string | undefined = process.env.KAFKA_PASSWORD;

if (!psw) {
  throw new Error("Please add the Kafka password in .env or .env.local");
}

async function getFile(
  repoOwner: string,
  repoName: string,
  repoBranch: string,
  filePath: string,
  lang: string,
  user: string,
  mode: boolean,
  headers: any,
  cyber: CyberSend
): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${repoBranch}/${filePath}`;

  try {
    const response = await axios.get(url, { headers });

    if (response.status === 200) {
      const fileContent = response.data;

      let messageData;
      if (mode) {
        const extractedData = await extractFunctionsAndClasses(
          fileContent,
          lang
        );
        // Send each extracted block separately
        for (const block of extractedData) {
          messageData = {
            username: user,
            message_send: block,
            path: filePath,
          };
          await cyber.sendMessages([messageData]);
        }
      } else {
        // Send the entire file content in non-deep mode
        messageData = {
          username: user,
          message_send: fileContent,
          path: filePath,
        };
        await cyber.sendMessages([messageData]);
      }

      return filePath;
    } else {
      throw new NextResponse(
        `Failed to fetch folder ${filePath}. Status: ${response.status}`
      );
    }
  } catch (error) {
    throw new NextResponse(`Error fetching file ${filePath}: ${error}`);
  }
  return null;
}

async function getFolder(
  owner: string,
  repo: string,
  branch: string,
  lang: string,
  user: string,
  mode: boolean,
  headers: any,
  dirPath: string = "",
  cyber: CyberSend
): Promise<string[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${dirPath}?ref=${branch}`;
  const files: string[] = [];

  try {
    const response = await axios.get(url, { headers });

    if (response.status === 200) {
      const content = response.data;

      for (const item of content) {
        if (item.type === "dir") {
          const subDirPath = dirPath ? `${dirPath}/${item.name}` : item.name;
          const subFiles = await getFolder(
            owner,
            repo,
            branch,
            lang,
            user,
            mode,
            headers,
            subDirPath,
            cyber
          );
          files.push(...subFiles); // Add subdirectory files
        } else if (item.name.endsWith(`.${lang}`)) {
          const filePath = extractDirectoryPath(item.url, repo, branch);
          if (filePath) {
            const fileContent = await getFile(
              owner,
              repo,
              branch,
              filePath,
              lang,
              user,
              mode,
              headers,
              cyber
            );
            if (fileContent) {
              files.push(fileContent); // Add the file path to the array
            }
          }
        }
      }
    } else {
      throw new NextResponse(
        `Failed to fetch folder ${dirPath}. Status: ${response.status}`
      );
    }
  } catch (error) {
    throw new NextResponse(`Error fetching folder ${dirPath}: ${error}`);
  }

  return files; // Return the list of file paths
}

function extractDirectoryPath(
  url: string,
  repo: string,
  branch: string
): string | null {
  const startIndex =
    url.indexOf(`${repo}/contents/`) + `${repo}/contents/`.length;
  const endIndex = url.indexOf(`?ref=${branch}`);
  if (startIndex !== -1 && endIndex !== -1) {
    return url.slice(startIndex, endIndex);
  }
  return null;
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Parse and validate the request body
    const json = await req.json();
    const { github, language, token, user, mode } = json;

    const headers = {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
    };

    const urlParts = github.replace("https://github.com/", "").split("/");
    const owner = urlParts[0];
    const repo = urlParts[1];
    const branch = urlParts[2] || "main";

    // Start the CyberSend producer once, instead of for each file
    const cyber = new CyberSend(psw!, "send_scan_message");
    await cyber.startProducer();

    const files = await getFolder(
      owner,
      repo,
      branch,
      language,
      user,
      mode,
      headers,
      "",
      cyber
    );

    return new NextResponse(JSON.stringify(files, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle validation errors
      return new NextResponse(
        JSON.stringify({ errors: "Wrong validation input" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
