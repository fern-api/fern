import { TaskContext } from "@fern-api/task-context";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { Overrides } from "./overridesSchema";
import { getOverridesPrompt } from "./prompt";
import { readFile } from "fs/promises";

export async function black({ workspace, context }: { workspace: OSSWorkspace; context: TaskContext }): Promise<void> {
    const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    for (const spec of workspace.specs) {
        if (spec.type === "openapi") {
            const openApiSpec = (await readFile(spec.absoluteFilepath, "utf8")).toString();

            const stream = client.beta.chat.completions
                .stream({
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "user",
                            content: getOverridesPrompt(openApiSpec)
                        }
                    ],
                    response_format: zodResponseFormat(Overrides, "openapi_overrides")
                })
                .on("refusal.delta", ({ delta }) => {
                    context.logger.error(delta);
                })
                .on("refusal.done", () => context.logger.error("Request refused by OpenAI"))
                .on("content.delta", ({ snapshot, parsed }) => {
                    context.logger.error("content:", snapshot);
                    context.logger.error("parsed:", JSON.stringify(parsed));
                })
                .on("content.done", (props) => {
                    if (props.parsed) {
                        // TODO: make this write out to a file
                        context.logger.info("\n\nfinished parsing!");
                        context.logger.info(`answer: ${JSON.stringify(props.parsed)}`);
                    }
                });

            await stream.done();
            await stream.finalChatCompletion();
        }
    }
}
