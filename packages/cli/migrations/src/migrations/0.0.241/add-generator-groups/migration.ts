import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile, writeFile } from "fs/promises";
import { Migration } from "../../../types/Migration";
import { getAllGeneratorYamlFiles } from "./getAllGeneratorYamlFiles";
import { GeneratorsConfigurationSchema as OldGeneratorsConfigurationSchema } from "./old-generators-configuration/GeneratorsConfigurationSchema";

export const migration: Migration = {
    name: "add-generator-groups",
    summary: "Adds groups to generators configuration",
    run: async ({ context }) => {
        const generatorYamlFiles = await getAllGeneratorYamlFiles(context);
        for (const filepath of generatorYamlFiles) {
            try {
                await migrateGeneratorsYml(filepath, context);
            } catch (error) {
                context.failWithoutThrowing(`Failed to migrate ${filepath}`, error);
            }
        }
    },
};

async function migrateGeneratorsYml(filepath: AbsoluteFilePath, context: TaskContext): Promise<void> {
    const contents = await readFile(filepath);
    const parsedDocument = OldGeneratorsConfigurationSchema.parse(contents);
    migrateDraftGenerators({ parsedDocument, filepath, context });
    migrateReleaseGenerators({ parsedDocument, filepath, context });
    await writeFile(filepath, parsedDocument.toString());
}
