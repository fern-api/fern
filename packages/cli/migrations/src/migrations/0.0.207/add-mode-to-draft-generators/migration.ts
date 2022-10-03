import { AbsoluteFilePath } from "@fern-api/core-utils";
import { TaskContext, TASK_FAILURE } from "@fern-api/task-context";
import { readFile, writeFile } from "fs/promises";
import YAML from "yaml";
import { Migration } from "../../../types/Migration";
import { getAllGeneratorYamlFiles } from "./getAllGeneratorYamlFiles";

export const migration: Migration = {
    name: "add-mode-to-draft-generators-migration",
    summary: "Adds mode to draft generators in generators.yml. Mode can either be download-files or artifact.",
    run: async ({ context }) => {
        const generatorYamlFiles = await getAllGeneratorYamlFiles(context);
        if (generatorYamlFiles === TASK_FAILURE) {
            return;
        }
        for (const filepath of generatorYamlFiles) {
            try {
                await migrateGeneratorsYml(filepath, context);
            } catch (error) {
                context.fail(`Failed to migrate ${filepath}`, error);
            }
        }
    },
};

async function migrateGeneratorsYml(filepath: AbsoluteFilePath, context: TaskContext): Promise<void> {
    const contents = await readFile(filepath);
    const parsedDocument = YAML.parseDocument(contents.toString());
    const draftGenerators = parsedDocument.get("draft");
    if (draftGenerators == null) {
        return;
    }
    if (!YAML.isSeq(draftGenerators)) {
        context.fail(`draft generators are not a list in ${filepath}`);
        return;
    }
    draftGenerators.items.forEach((draftGenerator) => {
        if (!YAML.isMap(draftGenerator)) {
            context.fail(`draft generator is not an object in ${filepath}`);
            return;
        }
        const name = draftGenerator.get("name");
        if (typeof name !== "string") {
            context.fail(`draft generator didn't have name in ${filepath}`);
            return;
        }
        const localOutput = draftGenerator.get("local-output");
        draftGenerator.delete("local-output");
        draftGenerator.set("mode", localOutput == null ? "publish" : "download-files");
        if (localOutput != null) {
            draftGenerator.set(
                "output-path",
                name.includes("openapi")
                    ? "./generated-openapi"
                    : name.includes("postman")
                    ? "./generated-postman"
                    : localOutput
            );
        }
    });
    await writeFile(filepath, parsedDocument.toString());
}
