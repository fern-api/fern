import { InteractiveTaskContext } from "@fern-api/task-context";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import OpenAI from "openai";
import { GET_OVERRIDES_PROMPT } from "./prompt";
import { transformSpecToSchema } from "./transformSpecToSchema";
import { writeFile } from "fs/promises";
import { dirname, join } from "path";
import { RelativeFilePath } from "@fern-api/fs-utils";
import yaml from "js-yaml";
import { tokenizeOpenApiSpec } from "../../utils/initv2/tokenizer";
import { mergeWithOverrides as coreMergeWithOverrides } from "@fern-api/core-utils";

export async function black({
    workspace,
    context
}: {
    workspace: OSSWorkspace;
    context: InteractiveTaskContext;
}): Promise<void> {
    const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    const schemas = await transformSpecToSchema({ workspace, context });
    for (const { openApiSpec, numEndpoints } of schemas) {
        context.startProgress(numEndpoints, 0);
        let chunkedOverrides = "";

        // Ideally we'd us the API spec directly to provide additional context, but to avoid manually parsing the API spec, we just use the IR
        // TODO: Update the prompt examples to use the IR instead of the API spec
        const chunkedAPI = await tokenizeOpenApiSpec({
            absolutePathToOpenAPI: openApiSpec.absoluteFilepath,
            // We're using gpt-4o-mini
            tokensPerChunk: 120000,
            path: openApiSpec.absoluteFilepath
        });

        let lastChunk: string | undefined = undefined;
        let endpointsCompleted = 0;
        for (const chunk of chunkedAPI) {
            const currentChunkOfOverrides: { chunk: string; endpointsCompleted: number } = await invokeOpenAIOverChunk({
                context,
                stringifiedSpec: chunk.stringifiedEndpoints,
                numEndpointsInChunk: chunk.numEndpointsInChunk,
                client,
                tenLinesSeed: lastChunk,
                endpointsCompleted
            });
            lastChunk = currentChunkOfOverrides.chunk;
            endpointsCompleted = currentChunkOfOverrides.endpointsCompleted;
            chunkedOverrides = mergeOverrides(chunkedOverrides, lastChunk);
        }

        context.updateProgress(numEndpoints);
        context.finishProgress();

        // TODO: It'd be nice to stream to a file, but given we probably need to format the YAML, we'll need to do that in memory.
        if (chunkedOverrides.length > 0) {
            await writeFile(
                join(dirname(openApiSpec.absoluteFilepath), RelativeFilePath.of("openapi-overrides.yml")),
                chunkedOverrides
            );
        }
    }
}

function mergeOverrides(base: string, overrides: string): string {
    if (base.length === 0) {
        return overrides;
    }

    const baseYaml = yaml.load(base, { json: true }) as Record<string, Record<string, Record<string, unknown>>>;
    const overridesYaml = yaml.load(overrides, { json: true }) as Record<
        string,
        Record<string, Record<string, unknown>>
    >;

    if ("paths" in baseYaml && baseYaml.paths != null && "paths" in overridesYaml && overridesYaml.paths != null) {
        coreMergeWithOverrides({
            data: baseYaml,
            overrides: overridesYaml
        });
    } else if ("paths" in baseYaml) {
        // noop
    } else if ("paths" in overridesYaml && overridesYaml.paths != null) {
        baseYaml.paths = overridesYaml.paths;
    } else {
        return "";
    }

    return yaml.dump(baseYaml);
}

async function invokeOpenAIOverChunk({
    context,
    stringifiedSpec,
    numEndpointsInChunk,
    client,
    endpointsCompleted = 0,
    tenLinesSeed = ""
}: {
    context: InteractiveTaskContext;
    stringifiedSpec: string;
    numEndpointsInChunk: number;
    client: OpenAI;
    endpointsCompleted?: number;
    tenLinesSeed?: string;
}): Promise<{ chunk: string; endpointsCompleted: number }> {
    const countOccurrences = (str: string, regex: RegExp) => [...str.matchAll(regex)].length;

    let stringifiedOverrides = "";

    let tenLines = tenLinesSeed;
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
                    role: "system",
                    content: `It is very important that every endpoint has an override, there should be ${numEndpointsInChunk} overrides in the final response.`
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
        .on("content.delta", ({ delta, snapshot }) => {
            stringifiedOverrides = snapshot;

            tenLines += delta;
            const lines = tenLines.split("\n");
            tenLines = lines.slice(-10).join("\n");
            context.setSubtitle(tenLines.replaceAll("```yaml", "").replaceAll("```", ""));

            const countMethodOverrides = countOccurrences(stringifiedOverrides, /x-fern-sdk-method-name/g);
            context.updateProgress(countMethodOverrides + endpointsCompleted);
        });

    await stream.done();
    await stream.finalChatCompletion();

    const index = stringifiedOverrides.indexOf("path:");
    stringifiedOverrides = stringifiedOverrides.substring(index).trim().replaceAll("```yaml", "").replaceAll("```", "");

    const countMethodOverrides = countOccurrences(stringifiedOverrides, /x-fern-sdk-method-name/g);
    return { chunk: stringifiedOverrides, endpointsCompleted: countMethodOverrides + endpointsCompleted };
}
