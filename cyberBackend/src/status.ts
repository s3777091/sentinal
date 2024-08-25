import { Client } from "@gradio/client";
import dotenv from "dotenv";

dotenv.config();

const hfToken: string | undefined = process.env.HUGGINGFACE_API_KEY;
const baseModel: string | undefined = process.env.BASE_ADMIN_MODEL;
if (!hfToken || !hfToken.startsWith("hf_")) {
  throw new Error(
    "HUGGINGFACE_API_KEY is either not defined or not in the correct format (must start with 'hf_')."
  );
}

if (!baseModel) {
  throw new Error("pls adding baseModel in .env or .env.local");
}

async function best() {
  const app = await Client.connect("dad1909/cyberapi_1", {
    hf_token: hfToken as `hf_${string}`,
  });

}

best().catch((error) => {
  console.error("Error in main function:", error);
});
