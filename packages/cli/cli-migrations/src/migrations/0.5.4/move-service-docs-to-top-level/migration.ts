import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError, TaskContext } from "@fern-api/task-context";
import { readFile, writeFile } from "fs/promises";
import YAML from "yaml";

import { Migration } from "../../../types/Migration.js";
import { getAllYamlFiles } from "./getAllYamlFiles.js";

export const migration: Migration = {
    name: "move-service-docs-to-top-level",
    summary: "Move service-level docs to the top-level of the file.",
    run: async ({ context }) => {
        const yamlFiles = await getAllYamlFiles(context);
        for (const filepath of yamlFiles) {
            try {
                await migrateYamlFile(filepath, context);
            } catch (error) {
                context.failWithoutThrowing(`Failed to migrate ${filepath}`, error, { code: CliError.Code.ParseError });
            }
        }
    }
};

async function migrateYamlFile(filepath: AbsoluteFilePath, context: TaskContext): Promise<void> {
    const contents = await readFile(filepath);
    const parsedDocument = YAML.parseDocument(contents.toString());

    if (!YAML.isMap(parsedDocument.contents)) {
        return context.failAndThrow("File is not a map", undefined, { code: CliError.Code.ParseError });
    }

    const service = parsedDocument.contents.get("service");
    if (service == null) {
        return;
    }

    if (!YAML.isMap(service)) {
        return context.failAndThrow("service is not a map", undefined, { code: CliError.Code.ParseError });
    }

    const indexOfServiceDocsPair = service.items.findIndex(
        (item) => YAML.isScalar(item.key) && item.key.value === "docs"
    );
    const docsPair = service.items[indexOfServiceDocsPair];
    if (docsPair == null) {
        return;
    }

    service.items.splice(indexOfServiceDocsPair, 1);

    parsedDocument.contents.items.unshift(docsPair);

    await writeFile(filepath, parsedDocument.toString());
}
