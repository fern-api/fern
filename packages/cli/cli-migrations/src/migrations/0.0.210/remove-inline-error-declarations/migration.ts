import { readFile, writeFile } from "fs/promises";
import YAML from "yaml";

import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { Migration } from "../../../types/Migration";
import { getAllYamlFiles } from "./getAllYamlFiles";

export const migration: Migration = {
    name: "remove-inline-error-declarations",
    summary: "moves inlined error declarations to be types.",
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

    const addType = (typeName: string, typeDeclaration: YAML.Node) => {
        const types = parsedDocument.get("types");
        if (types == null) {
            parsedDocument.set("types", {
                [typeName]: typeDeclaration
            });
        } else if (!YAML.isMap(types)) {
            context.failWithoutThrowing(`"types" is not a map in ${filepath}`);
        } else {
            types.set(typeName, typeDeclaration);
        }
    };

    const errors = parsedDocument.get("errors");
    if (errors == null) {
        return;
    }

    if (!YAML.isMap(errors)) {
        context.failWithoutThrowing(`"errors" is not a map in ${filepath}`);
        return;
    }

    for (const errorDeclaration of errors.items) {
        if (!YAML.isMap(errorDeclaration.value)) {
            context.failWithoutThrowing(`Error "${errorDeclaration.key}" is not a map in ${filepath}`);
            continue;
        }

        // move type to be its own declaration
        const errorType = errorDeclaration.value.get("type", true);
        if (errorType != null && typeof errorType.value !== "string") {
            const errorBodyName = `${errorDeclaration.key}Body`;
            addType(errorBodyName, errorType);
            errorDeclaration.value.set("type", errorBodyName);
        }

        // move status code
        const httpSection = errorDeclaration.value.get("http");
        if (httpSection != null) {
            if (!YAML.isMap(httpSection)) {
                context.failWithoutThrowing(`http in "${errorDeclaration.key}" is not a map in ${filepath}`);
            } else {
                const statusCode = httpSection.get("statusCode", true);
                errorDeclaration.value.delete("http");
                errorDeclaration.value.set("status-code", statusCode);
            }
        }
    }

    await writeFile(filepath, parsedDocument.toString());
}
