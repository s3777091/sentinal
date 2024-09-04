import { LanguagePatterns, PostDetail, userDetail } from "@/types/types";
import { User } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import smile from "@/public/img/AI/smile.png";
import { cache } from "react";
import { string } from "zod";

const prisma = new PrismaClient();

export async function getUser(user: User): Promise<userDetail> {
  try {
    const { emailAddresses, username: userUsername, imageUrl } = user;

    const email = emailAddresses[0].emailAddress;
    const username = userUsername || email.split("@")[0];

    // Check if the user exists in the database
    let ex_User = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    // If the user does not exist, create a new user
    if (!ex_User) {
      ex_User = await prisma.user.create({
        data: {
          email,
          username,
          image: imageUrl || smile.src,
        },
      });
    }

    // Return the user details
    return {
      email: ex_User.email,
      username: ex_User.username || "anonymous",
      userid: ex_User.id,
      imageUrl: ex_User.image || smile.src,
    };
  } catch (error) {
    console.error("Error:", error);
    // Optionally, rethrow the error or return a fallback userDetail object
    throw new Error("Failed to get or create user.");
  } finally {
    await prisma.$disconnect();
  }
}

const languagePatterns: Record<string, LanguagePatterns> = {
  py: {
    extractFunctionsAndClasses: (code: string) => {
      const blocks = extractPythonBlocks(code, ["def ", "class "]);
      return blocks.filter((block) => block.split("\n").length >= 10);
    },
  },
  python: {
    extractFunctionsAndClasses: (code: string) => {
      const blocks = extractPythonBlocks(code, ["def ", "class "]);
      return blocks.filter((block) => block.split("\n").length >= 10);
    },
  },
  javascript: {
    extractFunctionsAndClasses: (code: string) => {
      const blocks = extractBracketedBlocks(code, [
        "function ",
        "const ",
        "let ",
        "var ",
        "class ",
      ]);
      return blocks.filter((block) => block.split("\n").length >= 10);
    },
  },
  java: {
    extractFunctionsAndClasses: (code: string) => {
      const blocks = extractBracketedBlocks(code, [
        "public ",
        "private ",
        "protected ",
        "class ",
      ]);
      return blocks.filter((block) => block.split("\n").length >= 10);
    },
  },
  csharp: {
    extractFunctionsAndClasses: (code: string) => {
      const blocks = extractBracketedBlocks(code, [
        "public ",
        "private ",
        "protected ",
        "class ",
      ]);
      return blocks.filter((block) => block.split("\n").length >= 10);
    },
  },
};

function extractPythonBlocks(code: string, startKeywords: string[]): string[] {
  const lines = code.split("\n");
  const blocks: string[] = [];
  let currentBlock: string[] = [];
  let insideBlock = false;
  let currentIndentLevel = -1;

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    const indentLevel = line.search(/\S|$/);

    if (insideBlock) {
      if (trimmedLine === "" || indentLevel > currentIndentLevel) {
        currentBlock.push(line);
      } else {
        blocks.push(currentBlock.join("\n"));
        currentBlock = [line];
        insideBlock = startKeywords.some((keyword) =>
          trimmedLine.startsWith(keyword)
        );
        currentIndentLevel = indentLevel;
      }
    } else if (
      startKeywords.some((keyword) => trimmedLine.startsWith(keyword))
    ) {
      currentBlock = [line];
      insideBlock = true;
      currentIndentLevel = indentLevel;
    }
  });

  if (insideBlock) {
    blocks.push(currentBlock.join("\n"));
  }

  return blocks;
}

function extractBracketedBlocks(
  code: string,
  startKeywords: string[]
): string[] {
  const lines = code.split("\n");
  const blocks: string[] = [];
  let currentBlock: string[] = [];
  let insideBlock = false;
  let openBracesCount = 0;

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (insideBlock) {
      currentBlock.push(line);
      openBracesCount += (trimmedLine.match(/{/g) || []).length;
      openBracesCount -= (trimmedLine.match(/}/g) || []).length;

      if (openBracesCount === 0) {
        blocks.push(currentBlock.join("\n"));
        currentBlock = [];
        insideBlock = false;
      }
    } else if (
      startKeywords.some((keyword) => trimmedLine.startsWith(keyword))
    ) {
      currentBlock = [line];
      openBracesCount = (trimmedLine.match(/{/g) || []).length;
      insideBlock = openBracesCount > 0;
    }
  });

  if (insideBlock && openBracesCount === 0) {
    blocks.push(currentBlock.join("\n"));
  }

  return blocks;
}

export async function extractFunctionsAndClasses(
  codeMessage: string,
  language: string
): Promise<string[] | []> {
  const extractor = languagePatterns[language.toLowerCase()];
  if (!extractor) {
    throw new Error(
      `Language '${language}' not supported or patterns not defined.`
    );
  }

  return extractor.extractFunctionsAndClasses(codeMessage);
}

export const getPostDetail = cache(async (postId: string): Promise<PostDetail | null> => {
  return await prisma.post.findUnique({
    where: { id: parseInt(postId, 10) },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          image: true,
          bio: true,
        },
      },
      comments: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          postId: true,
          author: {
            select: {
              id: true,
              username: true,
              image: true,
            },
          },
        },
      },
    },
  });
});
