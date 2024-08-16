import { ChatBody } from "@/types/types";
import { Client, type SpaceStatus } from "@gradio/client";

const hfToken: string | undefined = process.env.HUGGINGFACE_API_KEY;

if (!hfToken || !hfToken.startsWith("hf_")) {
  throw new Error(
    "HUGGINGFACE_API_KEY is either not defined or not in the correct format (must start with 'hf_')."
  );
}


export async function POST(req: Request): Promise<Response> {
  try {
    const { inputMessage, prompType, length } = (await req.json()) as ChatBody;

    const client = await Client.connect("dad1909/cyberapi", {
      hf_token: hfToken as `hf_${string}`,
    });

    const submission = client.submit("/predict", {
      selected_model: "CyberSentinel",
      prompt: inputMessage,
      prompt_type: prompType,
      max_length: length,
    });

    let responseMessage = "";

    for await (const msg of submission) {
      if (msg.type === "data") {
        const resultData = msg.data;

        if (Array.isArray(resultData) && typeof resultData[0] === "string") {
          let msgArray = resultData as string[];
          let msg = msgArray[0];

          switch (prompType) {
            case "Information":
              msg = msg.replace(
                "Give me information about the following topic: ",
                ""
              );
              break;
            case "Vulnerability":
              msg = msg.replace(
                "Identify the line of code that is vulnerable and describe the type of software vulnerability.",
                ""
              );
              break;
            default:
              break;
          }

          responseMessage = msg.replace(inputMessage, "");
        } else {
          console.error("Unexpected data format:", resultData);
          return new Response("Unexpected data format", { status: 500 });
        }
      }
    }

    return new Response(JSON.stringify({ result: responseMessage }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error connecting to the API:", error);
    return new Response("Error", { status: 500 });
  }
}
