import { ExitStatusUpdate, GeneratorUpdate, LogLevel } from "@fern-fern/generator-exec-sdk/api";
import * as GeneratorExecParsing from "@fern-fern/generator-exec-sdk/serialization";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import { FernPostmanClient } from "@fern-fern/postman-sdk";
import * as PostmanParsing from "@fern-fern/postman-sdk/serialization";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { Collection, CollectionDefinition } from "postman-collection";
import { PostmanGeneratorConfigSchema } from "./config/schemas/PostmanGeneratorConfigSchema";
import { PublishConfigSchema } from "./config/schemas/PublishConfigSchema";
import { convertToPostmanCollection } from "./convertToPostmanCollection";
import { GeneratorNotificationService } from "./GeneratorNotificationService";
import { writePostmanGithubWorkflows } from "./writePostmanGithubWorkflows";

const DEFAULT_COLLECTION_OUTPUT_FILENAME = "collection.json";

export const getCollectionOutputFilename = (postmanGeneratorConfig?: PostmanGeneratorConfigSchema): string => {
    return postmanGeneratorConfig?.filename ?? DEFAULT_COLLECTION_OUTPUT_FILENAME;
};

export async function writePostmanCollection(pathToConfig: string): Promise<void> {
    try {
        // eslint-disable-next-line no-console
        console.log("Starting generator...");
        const configStr = await readFile(pathToConfig);
        // eslint-disable-next-line no-console
        console.log(`Read ${pathToConfig}`);
        const rawConfig = JSON.parse(configStr.toString());
        const config = await GeneratorExecParsing.GeneratorConfig.parse(rawConfig);

        if (!config.ok) {
            // eslint-disable-next-line no-console
            console.log(`Failed to read ${pathToConfig}`);
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const postmanGeneratorConfig = config.value.customConfig as any as PostmanGeneratorConfigSchema;
        // eslint-disable-next-line no-console
        console.log("Validated custom config");

        const collectionOutputFilename = getCollectionOutputFilename(postmanGeneratorConfig);

        const generatorLoggingClient = new GeneratorNotificationService(config.value);
        // eslint-disable-next-line no-console
        console.log("Initialized generator logging client");

        try {
            await generatorLoggingClient.sendUpdate(
                GeneratorUpdate.init({
                    packagesToPublish: []
                })
            );

            const ir = await loadIntermediateRepresentation(config.value.irFilepath);
            // eslint-disable-next-line no-console
            console.log(`Loaded intermediate representation from ${config.value.irFilepath}`);

            await generatorLoggingClient.sendUpdate(
                GeneratorUpdate.log({
                    level: LogLevel.Debug,
                    message: `Generating ${collectionOutputFilename}`
                })
            );
            const _collectionDefinition = convertToPostmanCollection(ir);
            const rawCollectionDefinition = await PostmanParsing.PostmanCollectionSchema.jsonOrThrow(
                _collectionDefinition
            );
            // eslint-disable-next-line no-console
            console.log("Converted ir to postman collection");

            await writeFile(
                path.join(config.value.output.path, collectionOutputFilename),
                JSON.stringify(rawCollectionDefinition, undefined, 2)
            );
            // eslint-disable-next-line no-console
            console.log(`Wrote postman collection to ${collectionOutputFilename}`);
            await generatorLoggingClient.sendUpdate(
                GeneratorUpdate.log({
                    level: LogLevel.Debug,
                    message: `Generated ${collectionOutputFilename}`
                })
            );

            const outputMode = config.value.output.mode;
            if (outputMode.type === "publish" && outputMode.publishTarget != null) {
                if (outputMode.publishTarget.type !== "postman") {
                    // eslint-disable-next-line no-console
                    console.log(`Received incorrect publish config (type is ${outputMode.type}`);
                    await generatorLoggingClient.sendUpdate(
                        GeneratorUpdate.log({
                            level: LogLevel.Error,
                            message: `Received incorrect publish config (type is ${outputMode.type})`
                        })
                    );
                    throw new Error("Received incorrect publish config!");
                }
                await publishCollection({
                    publishConfig: {
                        apiKey: outputMode.publishTarget.apiKey,
                        workspaceId: outputMode.publishTarget.workspaceId
                    },
                    collectionDefinition: {
                        ...rawCollectionDefinition,
                        item: rawCollectionDefinition.item.map((item) => {
                            if (item._type !== "container") {
                                return item;
                            }
                            return {
                                ...item,
                                description: item.description ?? undefined
                            };
                        }),
                        auth: rawCollectionDefinition.auth ?? undefined
                    }
                });
            } else if (outputMode.type === "github") {
                // eslint-disable-next-line no-console
                console.log("Writing Github workflows...");
                await writePostmanGithubWorkflows({
                    config: config.value,
                    githubOutputMode: outputMode
                });
            } else if (postmanGeneratorConfig?.publishing != null) {
                // eslint-disable-next-line no-console
                console.log("Publishing postman collection via legacy custom config...");
                await publishCollection({
                    publishConfig: postmanGeneratorConfig.publishing,
                    collectionDefinition: {
                        ...rawCollectionDefinition,
                        item: rawCollectionDefinition.item.map((item) => {
                            if (item._type !== "container") {
                                return item;
                            }
                            return {
                                ...item,
                                description: item.description ?? undefined
                            };
                        }),
                        auth: rawCollectionDefinition.auth ?? undefined
                    }
                });
            } else {
                // eslint-disable-next-line no-console
                console.log("Did not publish to postman or github");
            }

            await generatorLoggingClient.sendUpdate(GeneratorUpdate.exitStatusUpdate(ExitStatusUpdate.successful({})));
        } catch (e) {
            // eslint-disable-next-line no-console
            console.log("Encountered error", e);
            await generatorLoggingClient.sendUpdate(
                GeneratorUpdate.exitStatusUpdate(
                    ExitStatusUpdate.error({
                        message: e instanceof Error ? e.message : "Encountered error"
                    })
                )
            );
        }
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log("Encountered error", e);
        throw e;
    }
}

async function publishCollection({
    publishConfig,
    collectionDefinition
}: {
    publishConfig: PublishConfigSchema;
    collectionDefinition: CollectionDefinition;
}) {
    // eslint-disable-next-line no-console
    console.log("Publishing postman collection...");
    const postman = new FernPostmanClient({
        apiKey: publishConfig.apiKey
    });
    const workspace = publishConfig.workspaceId != null ? publishConfig.workspaceId : undefined;
    // eslint-disable-next-line no-console
    console.log(`Workspace id is ${workspace}`);
    const getCollectionMetadataResponse = await postman.collection.getAllCollectionMetadata({
        workspace
    });
    const collectionsToUpdate = getCollectionMetadataResponse.collections.filter((collectionMetadata) => {
        return collectionMetadata.name === collectionDefinition.info?.name;
    });
    if (collectionsToUpdate.length === 0) {
        // eslint-disable-next-line no-console
        console.log("Creating new postman collection!");
        await postman.collection.createCollection({
            workspace,
            body: { collection: new Collection(collectionDefinition) }
        });
    } else {
        await Promise.all(
            collectionsToUpdate.map(async (collectionMetadata) => {
                // eslint-disable-next-line no-console
                console.log("Updating postman collection!");
                await postman.collection.updateCollection(collectionMetadata.uid, {
                    collection: new Collection(collectionDefinition)
                });
            })
        );
    }
}

async function loadIntermediateRepresentation(pathToFile: string): Promise<IntermediateRepresentation> {
    const irString = (await readFile(pathToFile)).toString();
    const irJson = JSON.parse(irString);
    return IrSerialization.IntermediateRepresentation.parseOrThrow(irJson);
}
