import { readFile, writeFile } from "fs/promises";

import { Migration } from "../../../types/Migration";
import { getAllRootApiYamlFiles } from "./getAllRootApiYamlFiles";

export const migration: Migration = {
    name: "add-error-discriminant",
    summary: "Add error-discriminant to apiy.ml",
    run: async ({ context }) => {
        const yamlFiles = await getAllRootApiYamlFiles(context);
        for (const filepath of yamlFiles) {
            const contents = await readFile(filepath);
            const newContents = contents.toString() + "\nerror-discriminant: error";
            await writeFile(filepath, newContents);
        }
    }
};
