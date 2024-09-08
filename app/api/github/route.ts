import axios from "axios";
import { NextResponse } from "next/server";
import { z } from "zod";
import { extractFunctionsAndClasses } from "@/lib/action/github.action";
import { CyberSend } from "@dad1909/cyber";

const psw: string | undefined = process.env.KAFKA_PASSWORD;

if (!psw) {
  throw new Error("Please add the Kafka password in .env or .env.local");
}

// Updated getFile function with string return type
async function getFile(
  repoOwner: string,
  repoName: string,
  repoBranch: string,
  filePath: string,
  lang: string,
  user: string,
  mode: boolean,
  headers: any
): Promise<string | null> { // Returning a string or null
  const url = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${repoBranch}/${filePath}`;

  try {
    const response = await axios.get(url, { headers });
    if (response.status === 200) {
      if (mode) {
        const data = await extractFunctionsAndClasses(response.data, lang);

        // Process the extracted code blocks in "deep" mode
        for (const block of data) {
          const messageData = [
            {
              username: user,
              message_send: block,
              path: filePath,
            },
          ];

          // console.log(block);
          return filePath; // Return the file path as a string
        }
      } else {
        // Return the file path directly in "normal" mode
        return filePath;
      }
    } else {
      console.log(`Failed to get file ${filePath} from GitHub. Status code: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error(`An error occurred while fetching ${filePath}:`, error);
    return null;
  }

  return null;
}

// Updated getFolder function with string[] return type
async function getFolder(
  owner: string,
  repo: string,
  branch: string,
  lang: string,
  user: string,
  mode: boolean,
  headers: any,
  dirPath: string = ""
): Promise<string[]> { // Returning an array of strings (file paths)
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${dirPath}?ref=${branch}`;
  const files: string[] = [];

  try {
    const response = await axios.get(url, { headers });
    if (response.status === 200) {
      const content = response.data;

      for (const item of content) {
        if (item.type === "dir") {
          // Recursively fetch subdirectory files
          const subDirPath = dirPath ? `${dirPath}/${item.name}` : item.name;
          const subFiles = await getFolder(
            owner,
            repo,
            branch,
            lang,
            user,
            mode,
            headers,
            subDirPath
          );
          files.push(...subFiles);
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
              headers
            );
            if (fileContent) {
              files.push(fileContent);  // Add the file path to the list
            }
          }
        }
      }
    } else {
      console.log(
        `Failed to access folder ${dirPath} on GitHub. Status code: ${response.status}`
      );
    }
  } catch (error) {
    console.error(`An error occurred:`, error);
  }

  return files; // Return the array of file paths
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

// POST request handler
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Parse and validate the request body
    const json = await req.json();
    const { github, language, token, username, mode } = json;

    const headers = {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
    };

    const urlParts = github.replace("https://github.com/", "").split("/");
    const owner = urlParts[0];
    const repo = urlParts[1];
    const branch = urlParts[2] || "main";

    const files = await getFolder(
      owner,
      repo,
      branch,
      language,
      username,
      mode,
      headers
    );

    return new NextResponse(JSON.stringify(files, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle validation errors from Zod
      return new NextResponse(
        JSON.stringify({ errors: "Wrong validation input" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    console.error("Error:", error);
    return new NextResponse(
      "Something went wrong while processing the request",
      {
        status: 500,
      }
    );
  }
}