import { ExitStatusUpdate, GeneratorUpdate } from "@fern-fern/generator-logging-api-client/model";
import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { GeneratorConfig } from "@fern-fern/ir-model/generators";
import { CollectionId, WorkspaceId } from "@fern-fern/postman-collection-api-client/model";
import { CollectionService } from "@fern-fern/postman-collection-api-client/services";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { Collection, CollectionDefinition } from "postman-collection";
import { convertToPostmanCollection } from "./convertToPostmanCollection";
import { GeneratorLoggingWrapper } from "./generatorLoggingWrapper";
import { getPublishConfig, PublishConfig } from "./getPublishConfig";

const COLLECTION_OUTPUT_FILENAME = "collection.json";

export async function writePostmanCollection(pathToConfig: string): Promise<void> {
    const configStr = await readFile(pathToConfig);
    const config = JSON.parse(configStr.toString()) as GeneratorConfig;

    if (config.output == null) {
        throw new Error("Output directory is not specified.");
    }

    const publishConfig = getPublishConfig(config);

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

        if (publishConfig != null) {
            publishCollection(publishConfig, collectionDefinition);
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

async function publishCollection(publishConfig: PublishConfig, collectionDefinition: CollectionDefinition) {
    const collectionService = new CollectionService({
        origin: "https://api.getpostman.com",
        headers: {
            "X-API-Key": publishConfig.apiKey,
        },
    });
    const workspace = publishConfig.workspaceId != null ? WorkspaceId.of(publishConfig.workspaceId) : undefined;
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
                collectionId: CollectionId.of(collectionMetadata.uid),
                body: { collection: new Collection(collectionDefinition) },
            });
        });
    }
}

async function loadIntermediateRepresentation(pathToFile: string): Promise<IntermediateRepresentation> {
    return JSON.parse((await readFile(pathToFile)).toString());
}
