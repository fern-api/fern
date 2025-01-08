import { readFile, writeFile } from "fs/promises";
import YAML from "yaml";

import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { Migration } from "../../../types/Migration";
import { getAllYamlFiles } from "./getAllYamlFiles";

export const migration: Migration = {
    name: "add-value-key-to-type-examples",
    summary: "Add the 'value' key to type examples, so they can be named and documented",
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
    const types = parsedDocument.get("types");
    if (types == null) {
        return;
    }
    if (!YAML.isMap(types)) {
        throw new Error("'types' is not a map");
    }
    for (const type of types.items) {
        if (!YAML.isMap(type.value)) {
            continue;
        }
        const examples = type.value.get("examples");
        if (examples == null) {
            continue;
        }
        if (!YAML.isSeq(examples)) {
            context.failWithoutThrowing("'examples' are not a list");
            continue;
        }
        for (let i = 0; i < examples.items.length; i++) {
            const value = examples.get(i, true);
            examples.set(i, { value });
        }
    }
    await writeFile(filepath, parsedDocument.toString());
}
