import { LanguagePatterns, PostDetail, userDetail } from "@/types/types";
import { cache } from "react";

import { prisma } from "@/lib/db"; // Ensure you're importing the prisma client correctly


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