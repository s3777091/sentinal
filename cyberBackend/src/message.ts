import { HfInference } from '@huggingface/inference'

const hf = new HfInference('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')

// meta-llama/Llama-2-7b-chat-hf
async function fetchCompletion() {
    let out = "";
    for await (const chunk of hf.chatCompletionStream({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [
            { role: "user", content: "How do you make cheese? ,just the answer" },
        ],
        max_tokens: 500,
        temperature: 0.1,
        seed: 0,
        
    })) {
        if (chunk.choices && chunk.choices.length > 0) {
            out += chunk.choices[0].delta.content;
        }
    }
    console.log(out);
}

// Call the async function to execute the streaming process
fetchCompletion();