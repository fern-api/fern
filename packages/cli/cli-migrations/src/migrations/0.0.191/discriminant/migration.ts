import { readFile, writeFile } from "fs/promises";

import { AbsoluteFilePath } from "@fern-api/fs-utils";

import { Migration } from "../../../types/Migration";
import { getAllYamlFiles } from "./getAllYamlFiles";

export const migration: Migration = {
    name: "discriminant",
    summary: "Adds 'discriminant: \"_type\"' to all discriminated types.",
    run: async ({ context }) => {
        const yamlFilepaths = await getAllYamlFiles(context);
        for (const yamlFilepath of yamlFilepaths) {
            try {
                const fileContents = await getFileContents(yamlFilepath);
                const newContents = addDiscriminantToFile(fileContents);
                await writeFile(yamlFilepath, newContents);
            } catch (error) {
                context.failAndThrow("Failed to migrate " + yamlFilepath, error);
            }
        }
    }
};

async function getFileContents(filepath: AbsoluteFilePath): Promise<string> {
    const buffer = await readFile(filepath);
    return buffer.toString();
}

const UNION_REGEX = /^(\s{2,})union:\s*$/gm;

function addDiscriminantToFile(contents: string): string {
    return contents.replaceAll(UNION_REGEX, (result) => {
        const match = [...result.matchAll(UNION_REGEX)][0];
        const prefix = match?.[1];
        if (prefix == null) {
            return result;
        }

        const prefixForDiscriminantFields = " ".repeat(prefix.length * 1.5);
        return [
            `${prefix}discriminant:`,
            `${prefixForDiscriminantFields}value: _type`,
            `${prefixForDiscriminantFields}name: type`,
            result
        ].join("\n");
    });
}
