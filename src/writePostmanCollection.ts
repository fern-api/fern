import { validateSchema } from "@fern-api/config-management-commons";
import { ExitStatusUpdate, GeneratorConfig, GeneratorUpdate, LogLevel } from "@fern-fern/generator-exec-client/api";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { CollectionService } from "@fern-fern/postman-collection-api-client/services/collection";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { Collection, CollectionDefinition } from "postman-collection";
import { PostmanGeneratorConfigSchema } from "./config/schemas/PostmanGeneratorConfigSchema";
import { PublishConfigSchema } from "./config/schemas/PublishConfigSchema";
import { convertToPostmanCollection } from "./convertToPostmanCollection";
import { GeneratorLoggingWrapper } from "./generatorLoggingWrapper";
import { writePostmanGithubWorkflows } from "./writePostmanGithubWorkflows";

export const COLLECTION_OUTPUT_FILENAME = "collection.json";

export async function writePostmanCollection(pathToConfig: string): Promise<void> {
    const configStr = await readFile(pathToConfig);
    const config = JSON.parse(configStr.toString()) as GeneratorConfig;

    const postmanGeneratorConfig = await validateSchema(PostmanGeneratorConfigSchema, config.customConfig);

    const generatorLoggingClient = new GeneratorLoggingWrapper(config);

    try {
        await generatorLoggingClient.sendUpdate(
            GeneratorUpdate.init({
                packagesToPublish: [],
            })
        );

        const ir = await loadIntermediateRepresentation(config.irFilepath);
        const collectionDefinition = convertToPostmanCollection(ir);
        await writeFile(
            path.join(config.output.path, COLLECTION_OUTPUT_FILENAME),
            JSON.stringify(collectionDefinition, undefined, 4)
        );

        const outputMode = config.output.mode;
        if (outputMode.type === "publish" && outputMode.publishTarget != null) {
            if (outputMode.publishTarget.type !== "postman") {
                await generatorLoggingClient.sendUpdate(
                    GeneratorUpdate.log({
                        level: LogLevel.Error,
                        message: `Received incorrect publish config (type is ${outputMode.type})`,
                    })
                );
                throw new Error("Received incorrect publish config!");
            }
            await publishCollection({
                publishConfig: {
                    apiKey: outputMode.publishTarget.apiKey,
                    workspaceId: outputMode.publishTarget.workspaceId,
                },
                collectionDefinition: {
                    ...collectionDefinition,
                    auth: collectionDefinition.auth ?? undefined,
                },
            });
        } else if (outputMode.type === "github") {
            await writePostmanGithubWorkflows({
                config,
                githubOutputMode: outputMode,
            });
        } else if (postmanGeneratorConfig?.publishing != null) {
            await publishCollection({
                publishConfig: postmanGeneratorConfig.publishing,
                collectionDefinition: {
                    ...collectionDefinition,
                    auth: collectionDefinition.auth ?? undefined,
                },
            });
        }

        await generatorLoggingClient.sendUpdate(GeneratorUpdate.exitStatusUpdate(ExitStatusUpdate.successful()));
    } catch (e) {
        await generatorLoggingClient.sendUpdate(
            GeneratorUpdate.exitStatusUpdate(
                ExitStatusUpdate.error({
                    message: e instanceof Error ? e.message : "Encountered error",
                })
            )
        );
    }
}

async function publishCollection({
    publishConfig,
    collectionDefinition,
}: {
    publishConfig: PublishConfigSchema;
    collectionDefinition: CollectionDefinition;
}) {
    const collectionService = new CollectionService({
        origin: "https://api.getpostman.com",
        headers: {
            xApiKey: publishConfig.apiKey,
        },
    });
    const workspace = publishConfig.workspaceId != null ? publishConfig.workspaceId : undefined;
    console.log(`Workspace id is ${workspace}`);
    const getCollectionMetadataResponse = await collectionService.getAllCollectionMetadata({
        workspace,
    });
    if (!getCollectionMetadataResponse.ok) {
        return;
    }
    const collectionsToUpdate = getCollectionMetadataResponse.body.collections.filter((collectionMetadata) => {
        return collectionMetadata.name === collectionDefinition.info?.name;
    });
    if (collectionsToUpdate.length === 0) {
        console.log("Creating new postman collection!");
        await collectionService.createCollection({
            workspace,
            body: { collection: new Collection(collectionDefinition) },
        });
    } else {
        await collectionsToUpdate.forEach(async (collectionMetadata) => {
            console.log("Updating postman collection!");
            await collectionService.updateCollection({
                collectionId: collectionMetadata.uid,
                body: { collection: new Collection(collectionDefinition) },
            });
        });
    }
}

async function loadIntermediateRepresentation(pathToFile: string): Promise<IntermediateRepresentation> {
    return JSON.parse((await readFile(pathToFile)).toString());
}
