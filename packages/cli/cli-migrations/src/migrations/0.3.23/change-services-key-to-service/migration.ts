import { readFile, writeFile } from "fs/promises";
import YAML from "yaml";

import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { Migration } from "../../../types/Migration";
import { getAllYamlFiles } from "./getAllYamlFiles";

export const migration: Migration = {
    name: "change-services-key-to-service",
    summary: 'Rename the "services" key to "service". Only one service is allowed per file.',
    run: async ({ context }) => {
        const yamlFiles = await getAllYamlFiles(context);
        for (const filepath of yamlFiles) {
            try {
                await migrateYamlFile(filepath, context);
            } catch (error) {
                context.failWithoutThrowing(`Failed to migrate ${filepath}`, error);
            }
        }
    }
};

async function migrateYamlFile(filepath: AbsoluteFilePath, context: TaskContext): Promise<void> {
    const contents = await readFile(filepath);
    const parsedDocument = YAML.parseDocument(contents.toString());

    if (!YAML.isMap(parsedDocument.contents)) {
        return context.failAndThrow("File is not a map");
    }

    for (const pair of parsedDocument.contents.items) {
        if (YAML.isScalar(pair.key) && pair.key.value === "services") {
            if (!YAML.isMap(pair.value)) {
                return context.failAndThrow("Services are not a map");
            }

            const httpServices = pair.value.get("http");
            if (httpServices == null) {
                parsedDocument.contents.delete("services");
                return;
            }

            if (!YAML.isMap(httpServices)) {
                return context.failAndThrow("http is not a map");
            }
            const [firstService, ...remainingServices] = httpServices.items;
            if (firstService == null) {
                parsedDocument.contents.delete("services");
                return;
            }
            if (remainingServices.length > 0) {
                return context.failAndThrow("Tthere are multiple services defined");
            }

            pair.key.value = "service";
            pair.value = firstService.value;
        }
    }

    await writeFile(filepath, parsedDocument.toString());
}
