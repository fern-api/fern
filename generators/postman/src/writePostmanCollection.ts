import { readFile, writeFile } from "fs/promises";
import { startCase } from "lodash";
import path from "path";

import {
    ExitStatusUpdate,
    GeneratorNotificationService,
    GeneratorUpdate,
    LogLevel,
    parseGeneratorConfig,
    parseIR
} from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";

import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import { FernPostmanClient } from "@fern-fern/postman-sdk";
import * as PostmanParsing from "@fern-fern/postman-sdk/serialization";

import { PostmanGeneratorConfigSchema } from "./config/schemas/PostmanGeneratorConfigSchema";
import { PublishConfigSchema } from "./config/schemas/PublishConfigSchema";
import { convertToPostmanCollection } from "./convertToPostmanCollection";
import { writePostmanGithubWorkflows } from "./writePostmanGithubWorkflows";

const DEFAULT_COLLECTION_OUTPUT_FILENAME = "collection.json";

export const getCollectionOutputFilename = (postmanGeneratorConfig?: PostmanGeneratorConfigSchema): string => {
    return postmanGeneratorConfig?.filename ?? DEFAULT_COLLECTION_OUTPUT_FILENAME;
};

export async function writePostmanCollection(pathToConfig: string): Promise<void> {
    const config = await parseGeneratorConfig(pathToConfig);

    const generatorLoggingClient = new GeneratorNotificationService(config.environment);
    // eslint-disable-next-line no-console
    console.log("Initialized generator logging client");

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const postmanGeneratorConfig = config.customConfig as any as PostmanGeneratorConfigSchema;

        const collectionOutputFilename = getCollectionOutputFilename(postmanGeneratorConfig);

        try {
            await generatorLoggingClient.sendUpdate(
                GeneratorUpdate.init({
                    packagesToPublish: []
                })
            );

            const ir = await loadIntermediateRepresentation(config.irFilepath);
            // eslint-disable-next-line no-console
            console.log(`Loaded intermediate representation from ${config.irFilepath}`);

            await generatorLoggingClient.sendUpdate(
                GeneratorUpdate.log({
                    level: LogLevel.Debug,
                    message: `Generating ${collectionOutputFilename}`
                })
            );
            const _collectionDefinition = convertToPostmanCollection({
                ir,
                collectionName:
                    postmanGeneratorConfig?.["collection-name"] ??
                    ir.apiDisplayName ??
                    startCase(ir.apiName.originalName)
            });
            const rawCollectionDefinition = PostmanParsing.PostmanCollectionSchema.jsonOrThrow(_collectionDefinition);
            // eslint-disable-next-line no-console
            console.log("Converted ir to postman collection");

            await writeFile(
                path.join(config.output.path, collectionOutputFilename),
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

            const outputMode = config.output.mode;

            const publishConfig = ir.publishConfig;
            if (publishConfig?.type === "direct" && publishConfig.target.type === "postman") {
                await publishConfig._visit({
                    _other: () => undefined,
                    direct: async () => {
                        await publishCollection({
                            publishConfig: {
                                apiKey: publishConfig.target.apiKey,
                                workspaceId: publishConfig.target.workspaceId,
                                collectionId: publishConfig.target.collectionId
                            },
                            collection: rawCollectionDefinition
                        });
                    },
                    github: () => undefined
                });
            } else if (outputMode.type === "publish" && outputMode.publishTarget != null) {
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
                    collection: rawCollectionDefinition
                });
            } else if (outputMode.type === "github") {
                // eslint-disable-next-line no-console
                console.log("Writing Github workflows...");
                await writePostmanGithubWorkflows({
                    config,
                    githubOutputMode: outputMode
                });
            } else if (postmanGeneratorConfig?.publishing != null) {
                // eslint-disable-next-line no-console
                console.log("Publishing postman collection via legacy custom config...");
                await publishCollection({
                    publishConfig: postmanGeneratorConfig.publishing,
                    collection: rawCollectionDefinition
                });
            } else {
                // eslint-disable-next-line no-console
                console.log("Did not publish to postman or github");
            }

            await generatorLoggingClient.sendUpdate(GeneratorUpdate.exitStatusUpdate(ExitStatusUpdate.successful({})));
        } catch (e) {
            await generatorLoggingClient.sendUpdate(
                GeneratorUpdate.exitStatusUpdate(
                    ExitStatusUpdate.error({
                        message: e instanceof Error ? `${e.name}: ${e.message}\n${e.stack}` : "Encountered error"
                    })
                )
            );
        }
    } catch (e) {
        // eslint-disable-next-line no-console
        await generatorLoggingClient.sendUpdate(
            GeneratorUpdate.exitStatusUpdate(
                ExitStatusUpdate.error({
                    message: e instanceof Error ? `${e.name}: ${e.message}\n${e.stack}` : "Encountered error"
                })
            )
        );
        throw e;
    }
}

async function publishCollection({
    publishConfig,
    collection
}: {
    publishConfig: PublishConfigSchema;
    collection: PostmanParsing.PostmanCollectionSchema.Raw;
}) {
    // eslint-disable-next-line no-console
    console.log("Publishing postman collection...");
    const postman = new FernPostmanClient({
        apiKey: publishConfig.apiKey
    });
    const workspace = publishConfig.workspaceId != null ? publishConfig.workspaceId : undefined;

    if (publishConfig.collectionId == null) {
        // eslint-disable-next-line no-console
        console.log(`Workspace id is ${workspace}`);
        const getCollectionMetadataResponse = await postman.collection.getAllCollectionMetadata({
            workspace
        });
        const collectionsToUpdate = getCollectionMetadataResponse.collections.filter((collectionMetadata) => {
            return collectionMetadata.name === collection.info.name;
        });
        if (collectionsToUpdate.length === 0) {
            // eslint-disable-next-line no-console
            console.log("Creating new postman collection!");
            await postman.collection.createCollection({
                workspace,
                body: { collection }
            });
        } else {
            await Promise.all(
                collectionsToUpdate.map(async (collectionMetadata) => {
                    // eslint-disable-next-line no-console
                    console.log("Updating postman collection!");
                    await postman.collection.updateCollection(collectionMetadata.uid, {
                        collection
                    });
                })
            );
        }
    } else {
        await postman.collection.updateCollection(
            publishConfig.collectionId,
            {
                collection
            },
            {
                timeoutInSeconds: 180
            }
        );
    }
}

async function loadIntermediateRepresentation(pathToFile: string): Promise<IntermediateRepresentation> {
    return await parseIR<IntermediateRepresentation>({
        absolutePathToIR: AbsoluteFilePath.of(pathToFile),
        parse: IrSerialization.IntermediateRepresentation.parse
    });
}
