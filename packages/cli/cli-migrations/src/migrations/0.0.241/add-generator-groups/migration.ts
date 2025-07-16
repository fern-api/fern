import { readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";

import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";

import { Migration } from "../../../types/Migration";
import { getAllGeneratorYamlFiles } from "./getAllGeneratorYamlFiles";
import * as NewSchemas from "./new-generators-configuration";
import * as OldSchemas from "./old-generators-configuration";

export const migration: Migration = {
    name: "add-generator-groups",
    summary: "Adds groups to generators configuration",
    run: async ({ context }) => {
        const generatorYamlFiles = await getAllGeneratorYamlFiles(context);
        for (const filepath of generatorYamlFiles) {
            try {
                await migrateGeneratorsYml(filepath);
            } catch (error) {
                context.failWithoutThrowing(`Failed to migrate ${filepath}`, error);
            }
        }
    }
};

async function migrateGeneratorsYml(filepath: AbsoluteFilePath): Promise<void> {
    const contentsStr = await readFile(filepath);
    const contents = yaml.load(contentsStr.toString());
    const oldGeneratorsConfiguration = OldSchemas.GeneratorsConfigurationSchema.parse(contents);
    let newGeneratorsConfiguration: NewSchemas.GeneratorsConfigurationSchema = {};
    if (oldGeneratorsConfiguration.draft != null && oldGeneratorsConfiguration.draft.length > 0) {
        (newGeneratorsConfiguration.groups ??= {}).server = {
            generators: oldGeneratorsConfiguration.draft.map((draftGeneratorInvocation) =>
                convertDraftGeneratorInvocation(draftGeneratorInvocation)
            )
        };
        newGeneratorsConfiguration = {
            "default-group": "server",
            ...newGeneratorsConfiguration
        };
    }
    if (oldGeneratorsConfiguration.release != null && oldGeneratorsConfiguration.release.length > 0) {
        (newGeneratorsConfiguration.groups ??= {}).external = {
            generators: oldGeneratorsConfiguration.release.map((releaseGeneratorInvocation) =>
                convertReleaseGeneratorInvocation(releaseGeneratorInvocation)
            )
        };
    }
    await writeFile(filepath, yaml.dump(newGeneratorsConfiguration));
}

function convertDraftGeneratorInvocation(
    draftGeneratorInvocation: OldSchemas.DraftGeneratorInvocationSchema
): NewSchemas.GeneratorInvocationSchema {
    const newSchema: NewSchemas.GeneratorInvocationSchema = {
        name: draftGeneratorInvocation.name,
        version: draftGeneratorInvocation.version
    };
    if (draftGeneratorInvocation["output-path"] != null) {
        newSchema.output = {
            location: "local-file-system",
            path: draftGeneratorInvocation["output-path"]
        };
    }
    if (draftGeneratorInvocation.config != null) {
        newSchema.config = draftGeneratorInvocation.config;
    }
    return newSchema;
}

function convertReleaseGeneratorInvocation(
    releaseGeneratorInvocation: OldSchemas.ReleaseGeneratorInvocationSchema
): NewSchemas.GeneratorInvocationSchema {
    const newSchema: NewSchemas.GeneratorInvocationSchema = {
        name: releaseGeneratorInvocation.name,
        version: releaseGeneratorInvocation.version
    };
    if (releaseGeneratorInvocation.publishing != null) {
        newSchema.output = convertPublishingToOutput(releaseGeneratorInvocation.publishing);
    }
    if (releaseGeneratorInvocation.github != null) {
        newSchema.github = {
            repository: releaseGeneratorInvocation.github.repository
        };
    }
    if (releaseGeneratorInvocation.config != null) {
        newSchema.config = releaseGeneratorInvocation.config;
    }
    return newSchema;
}

function convertPublishingToOutput(publishing: OldSchemas.GeneratorPublishingSchema): NewSchemas.GeneratorOutputSchema {
    if (isNpmPublishing(publishing)) {
        return {
            location: "npm",
            ...publishing.npm
        };
    }
    if (isMavenPublishing(publishing)) {
        return {
            location: "maven",
            ...publishing.maven
        };
    }
    if (isPostmanPublishing(publishing)) {
        return {
            location: "postman",
            ...publishing.postman
        };
    }
    assertNever(publishing);
}

function isNpmPublishing(
    rawPublishingSchema: OldSchemas.GeneratorPublishingSchema
): rawPublishingSchema is OldSchemas.NpmPublishingSchema {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (rawPublishingSchema as OldSchemas.NpmPublishingSchema).npm != null;
}

function isMavenPublishing(
    rawPublishingSchema: OldSchemas.GeneratorPublishingSchema
): rawPublishingSchema is OldSchemas.MavenPublishingSchema {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (rawPublishingSchema as OldSchemas.MavenPublishingSchema).maven != null;
}

function isPostmanPublishing(
    rawPublishingSchema: OldSchemas.GeneratorPublishingSchema
): rawPublishingSchema is OldSchemas.PostmanPublishingSchema {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (rawPublishingSchema as OldSchemas.PostmanPublishingSchema).postman != null;
}
