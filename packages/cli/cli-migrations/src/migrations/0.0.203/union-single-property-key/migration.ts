import { readFile, writeFile } from "fs/promises";
import YAML from "yaml";

import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { Migration } from "../../../types/Migration";
import { getAllYamlFiles } from "./getAllYamlFiles";

export const migration: Migration = {
    name: "union-single-property-migration",
    summary: "migrates union types to set the `key` property on non-object subtypes to the discriminant value.",
    run: async ({ context }) => {
        const yamlFiles = await getAllYamlFiles(context);
        for (const filepath of yamlFiles) {
            try {
                await migrateFile(filepath, context);
            } catch (error) {
                context.failWithoutThrowing(`Failed to add 'key' property to union in ${filepath}`, error);
            }
        }
    }
};

async function migrateFile(filepath: AbsoluteFilePath, context: TaskContext): Promise<void> {
    const contents = await readFile(filepath);
    const parsedDocument = YAML.parseDocument(contents.toString());
    const types = parsedDocument.get("types");
    if (types == null) {
        return;
    }
    if (!YAML.isMap(types)) {
        context.failWithoutThrowing(`"types" is not a map in ${filepath}`);
        return;
    }

    for (const typeDeclaration of types.items) {
        if (YAML.isMap(typeDeclaration.value)) {
            const union = typeDeclaration.value.get("union");
            if (union == null) {
                continue;
            }
            if (!YAML.isMap(union)) {
                context.failWithoutThrowing(`"union" is not a map in ${filepath}`);
                continue;
            }
            for (const singleUnionType of union.items) {
                if (YAML.isScalar(singleUnionType.value)) {
                    singleUnionType.value = {
                        type: singleUnionType.value,
                        key: singleUnionType.key
                    };
                } else if (YAML.isMap(singleUnionType.value)) {
                    singleUnionType.value.add(new YAML.Pair("key", singleUnionType.key));
                }
            }
        }
    }

    await writeFile(filepath, parsedDocument.toString());
}
