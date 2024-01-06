import { Logger } from "@fern-api/logger";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { Snippets as RawSnippetsSerializer } from "@fern-fern/generator-exec-sdk/serialization";
import fs from "fs";

export async function readSnippets({
    logger,
    snippetsFilepath,
}: {
    logger: Logger,
    snippetsFilepath: string;
}): Promise<FernGeneratorExec.Snippets | undefined> {
    try {
        const snippetData = await fs.promises.readFile(snippetsFilepath, "utf-8");
        if (snippetData.length > 0) {
            return await RawSnippetsSerializer.parseOrThrow(JSON.parse(snippetData));
        }
        logger.debug(`Skipping snippet test for ${snippetsFilepath}: no snippets were found`);
        return undefined;
    } catch (err) {
        logger.debug(`Skipping snippet test for ${snippetsFilepath}: ${(err as Error).message}`);
        return undefined;
    }
}