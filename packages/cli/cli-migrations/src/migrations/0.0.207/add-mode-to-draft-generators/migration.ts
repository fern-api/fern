import { readFile, writeFile } from "fs/promises";
import YAML from "yaml";

import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { Migration } from "../../../types/Migration";
import { getAllGeneratorYamlFiles } from "./getAllGeneratorYamlFiles";

export const migration: Migration = {
    name: "add-mode-to-draft-generators",
    summary: "Adds 'mode' to draft generators in generators.yml, which can either be 'download-files' or 'publish'.",
    run: async ({ context }) => {
        const generatorYamlFiles = await getAllGeneratorYamlFiles(context);
        for (const filepath of generatorYamlFiles) {
            try {
                await migrateGeneratorsYml(filepath, context);
            } catch (error) {
                context.failWithoutThrowing(`Failed to migrate ${filepath}`, error);
            }
        }
    }
};

async function migrateGeneratorsYml(filepath: AbsoluteFilePath, context: TaskContext): Promise<void> {
    const contents = await readFile(filepath);
    const parsedDocument = YAML.parseDocument(contents.toString());
    const draftGenerators = parsedDocument.get("draft");
    if (draftGenerators == null) {
        return;
    }
    if (!YAML.isSeq(draftGenerators)) {
        context.failWithoutThrowing(`draft generators are not a list in ${filepath}`);
        return;
    }
    draftGenerators.items.forEach((draftGenerator) => {
        if (!YAML.isMap(draftGenerator)) {
            context.failWithoutThrowing(`draft generator is not an object in ${filepath}`);
            return;
        }
        const name = draftGenerator.get("name", true);
        if (typeof name?.value !== "string") {
            context.failWithoutThrowing(`draft generator didn't have name in ${filepath}`);
            return;
        }
        const localOutput = draftGenerator.get("local-output");
        draftGenerator.delete("local-output");
        draftGenerator.set("mode", localOutput == null ? "publish" : "download-files");
        if (localOutput != null) {
            draftGenerator.set(
                "output-path",
                name.value.includes("openapi")
                    ? "./generated-openapi"
                    : name.value.includes("postman")
                      ? "./generated-postman"
                      : localOutput
            );
        }
    });
    await writeFile(filepath, parsedDocument.toString());
}
