import { TaskContext } from "@fern-api/task-context";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import OpenAI from "openai";
import { GET_OVERRIDES_PROMPT } from "./prompt";
import { transformSpecToSchema } from "./transformSpecToSchema";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { dirname, join } from "path";
import { RelativeFilePath } from "@fern-api/fs-utils";

export async function black({ workspace, context }: { workspace: OSSWorkspace; context: TaskContext }): Promise<void> {
    const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    const schemas = await transformSpecToSchema({ workspace, context });
    for (const { openApiSpec, stringifiedSpec, schema } of schemas) {
        let stringifiedOverrides = "";
        const stream = client.beta.chat.completions
            .stream({
                // TODO: We need to figure out how to handle large API specs, since this model has a TPM (token per minute) of 200k
                // This vastly increases as we increase tiers, which doesn't seem that difficult, but we need 7 days post successful payment
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: GET_OVERRIDES_PROMPT
                    },
                    {
                        role: "user",
                        content: stringifiedSpec
                    }
                ]
                // TODO: there's a similar API limit on the number of parameters in the schema, so we likely need to chunk this up
                // and instead provide context to the LLM on what the previous overrides were
                //
                // There's tiny complexity in that you can have a bunch of resources across different paths that would make you want to add
                // another group name, but while you're chunking, you're not seeing enough to warrant a new group.
                // response_format: zodResponseFormat(schema, "openapi_overrides")
            })
            .on("refusal.done", () => context.logger.error("Request refused by OpenAI"))
            .on("content.delta", ({ snapshot, parsed }) => {
                context.logger.error("content:", snapshot);
                stringifiedOverrides = snapshot;
                context.logger.error("parsed:", JSON.stringify(parsed));
            });

        await stream.done();
        await stream.finalChatCompletion();

        stringifiedOverrides = stringifiedOverrides
            .trim()
            .replace("```yaml", "")
            .replace("```", "")
            .replace("|", "");
        // TODO: It'd be nice to stream to a file, but given we probably need to format the YAML, we'll need to do that in memory.
        if (stringifiedOverrides.length > 0) {
            await writeFile(
                join(dirname(openApiSpec.absoluteFilepath), RelativeFilePath.of("openapi-overrides.yml")),
                yaml.dump(stringifiedOverrides)
            );
        }
    }
}
