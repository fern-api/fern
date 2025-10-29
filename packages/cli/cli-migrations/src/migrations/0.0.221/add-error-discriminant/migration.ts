import { readFile, writeFile } from "fs/promises";

import { Migration } from "../../../types/Migration";
import { getAllRootApiYamlFiles } from "./getAllRootApiYamlFiles";

function ensureFinalNewline(content: string): string {
    return content.endsWith("\n") ? content : content + "\n";
}

export const migration: Migration = {
    name: "add-error-discriminant",
    summary: "Add error-discriminant to api.yml",
    run: async ({ context }) => {
        const yamlFiles = await getAllRootApiYamlFiles(context);
        for (const filepath of yamlFiles) {
            const contents = await readFile(filepath);
            const newContents = contents.toString() + "\nerror-discriminant: error";
            await writeFile(filepath, ensureFinalNewline(newContents));
        }
    }
};
