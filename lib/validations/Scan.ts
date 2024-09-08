import { supportedLanguages } from "@/constants";
import * as z from "zod";

// Function to check if the language is supported
const isLanguageSupported = (language: string): boolean => {
  const languagePattern = /^[a-zA-Z\-]+$/; // Allows letters and hyphens
  const normalizedLanguage = language.toLowerCase().trim();

  if (!languagePattern.test(normalizedLanguage)) {
    return false;
  }
  return supportedLanguages.has(normalizedLanguage);
};

// Function to check if the GitHub token is valid
const checkToken = (token: string): boolean => {
  const tokenPattern = /^ghp_[A-Za-z0-9]{36}$/;

  return tokenPattern.test(token);
};

// Function to validate the GitHub URL format and extract the relevant parts
const isValidGithubUrl = (url: string): boolean => {
  const githubPattern = /^https:\/\/github\.com\/([^/]+)\/([^/]+)(\/([^/]+))?$/;
  const match = url.match(githubPattern);

  if (!match) {
    return false; // Invalid URL structure
  }

  const [_, owner, repo, , branch] = match; // Destructure the matched parts
  if (!owner || !repo || !branch) {
    return false;
  }

  return true; // URL is valid
};

// Zod schema to validate the input fields with custom refinements
export const scanInputSchema = z.object({
    github: z
    .string()
    .url("Invalid GitHub URL")
    .refine(isValidGithubUrl, {
      message: "GitHub URL must follow the pattern: https://github.com/{owner}/{repo}/{branch}",
    }),
  language: z
    .string()
    .min(1, "Language is required")
    .refine(isLanguageSupported, {
      message: "Unsupported or invalid language format",
    }),
  token: z
    .string()
    .regex(/^ghp_[A-Za-z0-9]{36}$/, "Invalid GitHub token format")
    .refine(checkToken, {
      message: "Invalid GitHub token format",
    }),
    user: z.string().min(1, "Username is required"),
});
