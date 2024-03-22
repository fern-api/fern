import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import { FernPostmanClient } from "@fern-fern/postman-sdk";
import * as PostmanParsing from "@fern-fern/postman-sdk/serialization";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { PostmanGeneratorConfigSchema } from "./config/schemas/PostmanGeneratorConfigSchema";
import { PublishConfigSchema } from "./config/schemas/PublishConfigSchema";
import { convertToPostmanCollection } from "./convertToPostmanCollection";
import {
    GeneratorNotificationService,
    GeneratorExecParsing,
    ExitStatusUpdate,
    GeneratorUpdate,
    LogLevel,
    parseGeneratorConfig
} from "@fern-api/generator-commons";
import { writePostmanGithubWorkflows } from "./writePostmanGithubWorkflows";

const DEFAULT_COLLECTION_OUTPUT_FILENAME = "collection.json";

export const getCollectionOutputFilename = (postmanGeneratorConfig?: PostmanGeneratorConfigSchema): string => {
    return postmanGeneratorConfig?.filename ?? DEFAULT_COLLECTION_OUTPUT_FILENAME;
};

export async function writePostmanCollection(pathToConfig: string): Promise<void> {
    try {
        const config = await parseGeneratorConfig(pathToConfig);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const postmanGeneratorConfig = config.customConfig as any as PostmanGeneratorConfigSchema;
        // eslint-disable-next-line no-console
        console.log("Validated custom config");

        const collectionOutputFilename = getCollectionOutputFilename(postmanGeneratorConfig);

        const generatorLoggingClient = new GeneratorNotificationService(config.environment);
        // eslint-disable-next-line no-console
        console.log("Initialized generator logging client");

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
            const _collectionDefinition = convertToPostmanCollection(ir);
            const rawCollectionDefinition = await PostmanParsing.PostmanCollectionSchema.jsonOrThrow(
                _collectionDefinition
            );
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
}

async function loadIntermediateRepresentation(pathToFile: string): Promise<IntermediateRepresentation> {
    const irString = (await readFile(pathToFile)).toString();
    const irJson = JSON.parse(irString);
    return IrSerialization.IntermediateRepresentation.parseOrThrow(irJson);
}
