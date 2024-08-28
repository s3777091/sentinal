import { ScanInput } from "@/types/types";
import axios from "axios";
import { CyberSend } from "@dad1909/cyber";

const psw: string | undefined = process.env.KAFKA_PASSWORD;

if (!psw) {
  throw new Error("Please add the Kafka password in .env or .env.local");
}

interface FileContent {
  path: string;
  content: string;
}

async function getFile(
  repoOwner: string,
  repoName: string,
  repoBranch: string,
  filePath: string,
  user: string,
  headers: any
): Promise<FileContent | null> {
  const url = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${repoBranch}/${filePath}`;

  try {
    const cyber = new CyberSend(psw!, "send_scan_message");
    await cyber.startProducer();
    const response = await axios.get(url, { headers });
    if (response.status === 200) {
      const messageData = [
        {
          username: user,
          message_send: response.data,
        },
      ];
      // Send the message using CyberSend
      // await cyber.sendMessages(messageData);
      return {
        path: filePath,
        content: response.data,
      };
    } else {
      console.log(
        `Failed to get file ${filePath} from GitHub. Status code: ${response.status}`
      );
      return null;
    }
  } catch (error) {
    console.error(`An error occurred while fetching ${filePath}:`, error);
    return null;
  }
}

async function getFolder(
  owner: string,
  repo: string,
  branch: string,
  lang: string,
  user: string,
  headers: any,
  dirPath: string = ""
): Promise<FileContent[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${dirPath}?ref=${branch}`;
  const files: FileContent[] = [];

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
              user,
              headers
            );
            if (fileContent) {
              files.push(fileContent);
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

  return files;
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

export async function POST(req: Request): Promise<Response> {
  try {
    const { github, language, token, user } = (await req.json()) as ScanInput;

    const headers = {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
    };

    const urlParts = github.replace("https://github.com/", "").split("/");
    const owner = urlParts[0];
    const repo = urlParts[1];
    const branch = urlParts[2] || "main";

    if (!owner || !repo || !branch) {
      throw new Error("Invalid GitHub repository information provided.");
    }

    const files = await getFolder(owner, repo, branch, language, user, headers);

    return new Response(JSON.stringify(files, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response("Something went wrong while processing the request", {
      status: 500,
    });
  }
}
