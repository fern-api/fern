import { readFile, writeFile } from "fs/promises";

import { AbsoluteFilePath } from "@fern-api/fs-utils";

import { Migration } from "../../../types/Migration";
import { getAllGeneratorYamlFiles } from "./getAllGeneratorYamlFiles";

export const migration: Migration = {
    name: "add-suffix-to-docs-domain",
    summary: "Adds a docs.buildwithfern.com suffix to the docs domain",
    run: async ({ context }) => {
        const generatorYamlFiles = await getAllGeneratorYamlFiles(context);
        for (const filepath of generatorYamlFiles) {
            try {
                await migrateYamlFile(filepath);
            } catch (error) {
                context.failWithoutThrowing(`Failed to migrate ${filepath}`, error);
            }
        }
    }
};

async function migrateYamlFile(filepath: AbsoluteFilePath): Promise<void> {
    const contents = await readFile(filepath);

    const domainSuffix = process.env.DOMAIN_SUFFIX ?? "docs.buildwithfern.com";
    const regex = /(docs:\s*domain:\s*)"([^"]*)"/g;

    const updatedSnapshot = contents.toString().replace(regex, (_match, _prefix, domain) => {
        return `docs:
      domain: "${domain}.${domainSuffix}"`;
    });

    await writeFile(filepath, updatedSnapshot.toString());
}
