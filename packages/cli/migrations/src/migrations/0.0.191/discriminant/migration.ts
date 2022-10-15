import { AbsoluteFilePath } from "@fern-api/core-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile, writeFile } from "fs/promises";
import { Migration } from "../../../types/Migration";
import { getAllYamlFiles } from "./getAllYamlFiles";

export const migration: Migration = {
    name: "discriminant",
    summary: "Adds 'discriminant: \"_type\"' to all discriminated types.",
    run: async ({ context }) => {
        const yamlFilepaths = await getAllYamlFiles(context);
        for (const yamlFilepath of yamlFilepaths) {
            const fileContents = await getFileContents({ filepath: yamlFilepath, context });
            const newContents = addDiscriminantToFile(fileContents);
            await writeFile(yamlFilepath, newContents);
        }
    },
};

async function getFileContents({
    filepath,
    context,
}: {
    filepath: AbsoluteFilePath;
    context: TaskContext;
}): Promise<string> {
    try {
        const buffer = await readFile(filepath);
        return buffer.toString();
    } catch (error) {
        return context.fail("Failed to open file: " + filepath, error);
    }
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
            result,
        ].join("\n");
    });
}
