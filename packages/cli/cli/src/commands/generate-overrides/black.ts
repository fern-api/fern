import { parse } from "@fern-api/openapi-ir-parser";
import { TaskContext } from "@fern-api/task-context";
import { getAllOpenAPISpecs, OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { Overrides } from "./overridesSchema";
import { getOverridesPrompt } from "./prompt";

async function black({
    workspace,
    context,
    useAI = true
}: {
    workspace: OSSWorkspace;
    context: TaskContext;
    useAI: boolean;
}): Promise<void> {
    if (useAI) {
        const client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        const stream = client.beta.chat.completions
            .stream({
                model: "o1-mini-2024-09-12",
                messages: [
                    {
                        role: "user",
                        content: getOverridesPrompt("openApiSpec")
                    }
                ],
                response_format: zodResponseFormat(Overrides, "openapi_overrides")
            })
            .on("refusal.delta", ({ delta }) => {
                process.stdout.write(delta);
            })
            .on("refusal.done", () => console.log("\n\nrequest refused 😱"))
            .on("content.delta", ({ snapshot, parsed }) => {
                console.log("content:", snapshot);
                console.log("parsed:", parsed);
                console.log();
            })
            .on("content.done", (props) => {
                if (props.parsed) {
                    console.log("\n\nfinished parsing!");
                    console.log(`answer: ${JSON.stringify(props.parsed)}`);
                }
            });

        await stream.done();
        await stream.finalChatCompletion();
    }
}
