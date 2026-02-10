import { readFile, writeFile } from "fs/promises";

import { Migration } from "../../../types/Migration.js";
import { getAllYamlFiles } from "./getAllYamlFiles.js";

export const migration: Migration = {
    name: "rename-alias-key-to-type",
    summary: "Renames the 'alias' key to 'type'",
    run: async ({ context }) => {
        const yamlFiles = await getAllYamlFiles(context);
        for (const filepath of yamlFiles) {
            const contents = await readFile(filepath);
            const newContents = contents.toString().replaceAll(" alias:", " type:");
            await writeFile(filepath, newContents);
        }
    }
};
