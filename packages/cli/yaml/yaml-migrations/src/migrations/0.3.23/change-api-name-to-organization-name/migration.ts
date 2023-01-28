import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { readFile, writeFile } from "fs/promises";
import YAML from "yaml";
import { Migration } from "../../../types/Migration";
import { getAllApiYmlFiles, getOrganizationName } from "./utils";

export const migration: Migration = {
    name: "change-api-name-to-organization-name",
    summary: 'Change the "name" field in api.yml from "api" to your organization name',
    run: async ({ context }) => {
        const organizationName = await getOrganizationName(context);
        const yamlFiles = await getAllApiYmlFiles(context);
        for (const filepath of yamlFiles) {
            try {
                await migrateApiYmlFile({ filepath, organizationName });
            } catch (error) {
                context.failWithoutThrowing(`Failed to migrate ${filepath}`, error);
            }
        }
    },
};

async function migrateApiYmlFile({
    filepath,
    organizationName,
}: {
    filepath: AbsoluteFilePath;
    organizationName: string;
}): Promise<void> {
    const contents = await readFile(filepath);
    const parsedDocument = YAML.parseDocument(contents.toString());
    if (parsedDocument.get("name") !== "api") {
        return;
    }
    parsedDocument.set("name", organizationName);
    await writeFile(filepath, parsedDocument.toString());
}
