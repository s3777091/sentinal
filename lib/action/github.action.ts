"use server";
import { supportedLanguages } from "@/constants";
import { LanguagePatterns } from "@/types/types";


// Memoized regex patterns for performance
const commentPatterns = {
  singleLine: /\/\/.*$/gm,
  multiLine: /\/\*[\s\S]*?\*\//g,
};



// Function to check if the language is supported
export const isLanguageSupported = (language: string): boolean => {
  const languagePattern = /^[a-zA-Z\-]+$/; // Allows letters and hyphens
  const normalizedLanguage = language.toLowerCase().trim();

  if (!languagePattern.test(normalizedLanguage)) {
    return false;
  }
  return supportedLanguages.has(normalizedLanguage);
};

// Function to check if the GitHub token is valid
export const checkToken = (token: string | null): boolean => {
  if (!token) {
    return true; // Allow null or empty token
  }
  const tokenPattern = /^ghp_[A-Za-z0-9]{36}$/;
  return tokenPattern.test(token);
};

// Function to validate the GitHub URL format and extract the relevant parts
export const isValidGithubUrl = (url: string): boolean => {
  const githubPattern = /^https:\/\/github\.com\/([^/]+)\/([^/]+)(\/([^/]+))?$/;
  const match = url.match(githubPattern);

  if (!match) {
    return false; // Invalid URL structure
  }

  const [_, owner, repo, , branch] = match;
  if (!owner || !repo || !branch) {
    return false;
  }

  return true; // URL is valid
};

// Function to remove comments (single-line and multi-line) and extra spaces
export async function preprocessCode(code: string): Promise<string> {
  // Regex patterns to match single-line and multi-line comments
  const singleLineCommentPattern = /\/\/.*$/gm; // Matches // comments
  const multiLineCommentPattern = /\/\*[\s\S]*?\*\//gm; // Matches /* comments */

  // Remove single-line and multi-line comments
  code = code
    .replace(singleLineCommentPattern, "") // Remove single-line comments
    .replace(multiLineCommentPattern, ""); // Remove multi-line comments

  // Remove unnecessary empty lines and trim each line
  return code
    .split("\n") // Split code into lines
    .map((line) => line.trim()) // Trim each line
    .filter((line) => line !== "") // Remove empty lines
    .join("\n"); // Join the lines back together
}

// Consolidate similar logic across languages into a single function
const blockExtractors = {
  pythonBasedExtractor: (code: string, keywords: string[]) => extractPythonBlocks(code, keywords),
  bracketedExtractor: (code: string, keywords: string[]) => extractBracketedBlocks(code, keywords),
};

// Reduced and consolidated patterns for all languages
const languagePatterns: Record<string, LanguagePatterns> = {
  python: { extractFunctionsAndClasses: (code: string) => blockExtractors.pythonBasedExtractor(code, ["def ", "class "]) },
  py: { extractFunctionsAndClasses: (code: string) => blockExtractors.pythonBasedExtractor(code, ["def ", "class "]) },
  javascript: { extractFunctionsAndClasses: (code: string) => blockExtractors.bracketedExtractor(code, ["function ", "const ", "let ", "var ", "class "]) },
  js: { extractFunctionsAndClasses: (code: string) => blockExtractors.bracketedExtractor(code, ["function ", "const ", "let ", "var ", "class "]) },
  typescript: { extractFunctionsAndClasses: (code: string) => blockExtractors.bracketedExtractor(code, ["function ", "const ", "let ", "class "]) },
  ts: { extractFunctionsAndClasses: (code: string) => blockExtractors.bracketedExtractor(code, ["function ", "const ", "let ", "class "]) },
  csharp: { extractFunctionsAndClasses: (code: string) => blockExtractors.bracketedExtractor(code, ["public ", "private ", "protected ", "class "]) },
  cs: { extractFunctionsAndClasses: (code: string) => blockExtractors.bracketedExtractor(code, ["public ", "private ", "protected ", "class "]) },
  ruby: { extractFunctionsAndClasses: (code: string) => blockExtractors.pythonBasedExtractor(code, ["def ", "class "]) },
  rb: { extractFunctionsAndClasses: (code: string) => blockExtractors.pythonBasedExtractor(code, ["def ", "class "]) },
  php: { extractFunctionsAndClasses: (code: string) => blockExtractors.bracketedExtractor(code, ["function ", "class "]) },
  go: { extractFunctionsAndClasses: (code: string) => blockExtractors.bracketedExtractor(code, ["func ", "struct ", "class "]) },
  c: { extractFunctionsAndClasses: (code: string) => blockExtractors.bracketedExtractor(code, ["void ", "int ", "class "]) },
  cpp: { extractFunctionsAndClasses: (code: string) => blockExtractors.bracketedExtractor(code, ["void ", "int ", "public ", "private ", "protected ", "class "]) },
  swift: { extractFunctionsAndClasses: (code: string) => blockExtractors.bracketedExtractor(code, ["func ", "class ", "struct ", "enum "]) },
  kotlin: { extractFunctionsAndClasses: (code: string) => blockExtractors.bracketedExtractor(code, ["fun ", "class ", "object "]) },
  r: { extractFunctionsAndClasses: (code: string) => blockExtractors.pythonBasedExtractor(code, ["function ", "class "]) },
  "objective-c": { extractFunctionsAndClasses: (code: string) => blockExtractors.bracketedExtractor(code, ["void ", "int ", "class "]) },
  m: { extractFunctionsAndClasses: (code: string) => blockExtractors.bracketedExtractor(code, ["void ", "int ", "class "]) },
  perl: { extractFunctionsAndClasses: (code: string) => blockExtractors.pythonBasedExtractor(code, ["sub ", "package "]) },
  pl: { extractFunctionsAndClasses: (code: string) => blockExtractors.pythonBasedExtractor(code, ["sub ", "package "]) },
  rust: { extractFunctionsAndClasses: (code: string) => blockExtractors.bracketedExtractor(code, ["fn ", "struct ", "enum ", "impl "]) },
  rs: { extractFunctionsAndClasses: (code: string) => blockExtractors.bracketedExtractor(code, ["fn ", "struct ", "enum ", "impl "]) },
  scala: { extractFunctionsAndClasses: (code: string) => blockExtractors.bracketedExtractor(code, ["def ", "class ", "object "]) },
  lua: { extractFunctionsAndClasses: (code: string) => blockExtractors.pythonBasedExtractor(code, ["function "]) },
  shell: { extractFunctionsAndClasses: (code: string) => blockExtractors.pythonBasedExtractor(code, ["function "]) },
  sh: { extractFunctionsAndClasses: (code: string) => blockExtractors.pythonBasedExtractor(code, ["function "]) },
  dart: { extractFunctionsAndClasses: (code: string) => blockExtractors.bracketedExtractor(code, ["void ", "class ", "import "]) },
  haskell: { extractFunctionsAndClasses: (code: string) => blockExtractors.pythonBasedExtractor(code, ["module ", "class "]) },
  hs: { extractFunctionsAndClasses: (code: string) => blockExtractors.pythonBasedExtractor(code, ["module ", "class "]) },
  elixir: { extractFunctionsAndClasses: (code: string) => blockExtractors.pythonBasedExtractor(code, ["defmodule ", "def "]) },
  ex: { extractFunctionsAndClasses: (code: string) => blockExtractors.pythonBasedExtractor(code, ["defmodule ", "def "]) },
  clojure: { extractFunctionsAndClasses: (code: string) => blockExtractors.pythonBasedExtractor(code, ["defn ", "def "]) },
  clj: { extractFunctionsAndClasses: (code: string) => blockExtractors.pythonBasedExtractor(code, ["defn ", "def "]) },
  fsharp: { extractFunctionsAndClasses: (code: string) => blockExtractors.bracketedExtractor(code, ["let ", "module ", "class "]) },
  fs: { extractFunctionsAndClasses: (code: string) => blockExtractors.bracketedExtractor(code, ["let ", "module ", "class "]) },
  vbnet: { extractFunctionsAndClasses: (code: string) => blockExtractors.bracketedExtractor(code, ["Sub ", "Function ", "Class "]) },
  vb: { extractFunctionsAndClasses: (code: string) => blockExtractors.bracketedExtractor(code, ["Sub ", "Function ", "Class "]) },
  matlab: { extractFunctionsAndClasses: (code: string) => blockExtractors.pythonBasedExtractor(code, ["function "]) },
  groovy: { extractFunctionsAndClasses: (code: string) => blockExtractors.bracketedExtractor(code, ["def ", "class ", "void "]) },
  erlang: { extractFunctionsAndClasses: (code: string) => blockExtractors.pythonBasedExtractor(code, ["-module(", "-export(", "fun "]) },
  erl: { extractFunctionsAndClasses: (code: string) => blockExtractors.pythonBasedExtractor(code, ["-module(", "-export(", "fun "]) },
  julia: { extractFunctionsAndClasses: (code: string) => blockExtractors.pythonBasedExtractor(code, ["function ", "module "]) },
  jl: { extractFunctionsAndClasses: (code: string) => blockExtractors.pythonBasedExtractor(code, ["function ", "module "]) },
};

// Extract Python blocks using indentation (optimized for early returns)
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
        currentBlock = [];
        insideBlock = false;
      }
    }

    if (!insideBlock && startKeywords.some((keyword) => trimmedLine.startsWith(keyword))) {
      currentBlock = [line];
      insideBlock = true;
      currentIndentLevel = indentLevel;
    }
  });

  if (currentBlock.length) blocks.push(currentBlock.join("\n"));
  return blocks;
}

function extractBracketedBlocks(code: string, startKeywords: string[]): string[] {
  const lines = code.split("\n");
  const blocks: string[] = [];
  let currentBlock: string[] = [];
  let openBracesCount = 0;

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (openBracesCount > 0) {
      currentBlock.push(line);
      openBracesCount += (trimmedLine.match(/{/g) || []).length;
      openBracesCount -= (trimmedLine.match(/}/g) || []).length;

      if (openBracesCount === 0) {
        blocks.push(currentBlock.join("\n"));
        currentBlock = [];
      }
    } else if (startKeywords.some((keyword) => trimmedLine.startsWith(keyword))) {
      currentBlock = [line];
      openBracesCount = (trimmedLine.match(/{/g) || []).length;
    }
  });

  if (currentBlock.length && openBracesCount === 0) {
    blocks.push(currentBlock.join("\n"));
  }
  return blocks;
}

// Main extraction function for functions and classes
export async function extractFunctionsAndClasses(
  codeMessage: string,
  language: string
): Promise<string[] | []> {
  const extractor = languagePatterns[language.toLowerCase()];
  if (!extractor) {
    throw new Error(`Language '${language}' not supported or patterns not defined.`);
  }

  // Preprocess the code to remove comments and unnecessary spaces
  const cleanedCode = await preprocessCode(codeMessage);
  return extractor.extractFunctionsAndClasses(cleanedCode);
}