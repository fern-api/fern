import { createWriteStream } from "fs";
import { mkdir, readdir } from "fs/promises";
import { pipeline } from "stream";
import { promisify } from "util";

import { AbstractGeneratorContext } from "@fern-api/browser-compatible-base-generator";
import { AbsoluteFilePath, RelativeFilePath, join, relative } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";

const LOCAL_FILE_SCHEME = "file:///";
const PROTOBUF_ZIP_FILENAME = "proto.zip";

export interface SourceConfig {
    sources: ApiDefinitionSource[];
}

export type ApiDefinitionSource = ProtoDefinitionSource | OpenAPIDefinitionSource;

export interface ProtoDefinitionSource {
    type: "proto";
    protoRootUrl: string;
}

export interface OpenAPIDefinitionSource {
    type: "openapi";
}

export class SourceFetcher {
    private context: AbstractGeneratorContext;
    private sourceConfig: SourceConfig | undefined;

    constructor({
        context,
        sourceConfig
    }: {
        context: AbstractGeneratorContext;
        sourceConfig: SourceConfig | undefined;
    }) {
        this.context = context;
        this.sourceConfig = sourceConfig;
    }

    // Copies and returns all of the Protobuf source files (if any) to the given absolutePathToProtoDirectory.
    public async copyProtobufSources(absolutePathToProtoDirectory: AbsoluteFilePath): Promise<RelativeFilePath[]> {
        const protobufSourceURLs: string[] = [];
        for (const source of this.sourceConfig?.sources ?? []) {
            if (source.type === "proto") {
                protobufSourceURLs.push(source.protoRootUrl);
            }
        }

        if (protobufSourceURLs.length === 0) {
            return [];
        }

        this.context.logger.debug("Copying protobuf source files ...");

        this.context.logger.debug(`mkdir ${absolutePathToProtoDirectory}`);
        await mkdir(absolutePathToProtoDirectory, { recursive: true });

        for (const protobufSourceURL of protobufSourceURLs) {
            if (this.isLocalSourceURL(protobufSourceURL)) {
                const cleanProtobufSourceURL = protobufSourceURL.replace(LOCAL_FILE_SCHEME, "");
                await this.copyLocalProtobufSource({
                    absolutePathToProtoDirectory,
                    protobufSourceURL: cleanProtobufSourceURL
                });
                continue;
            }
            await this.copyRemoteProtobufSource({ absolutePathToProtoDirectory, protobufSourceURL });
        }

        return this.findFiles(absolutePathToProtoDirectory);
    }

    private async copyLocalProtobufSource({
        absolutePathToProtoDirectory,
        protobufSourceURL
    }: {
        absolutePathToProtoDirectory: AbsoluteFilePath;
        protobufSourceURL: string;
    }): Promise<void> {
        // Note that we use `find` in combination with `cp` because the alternative
        // is not supported in every environment. This is behaviorally equivalent to
        // the following:
        //
        //  `cp -r ${protobufSourceURL}/* ${absolutePathToProtoDirectory}`
        this.context.logger.debug(`Copying source from ${protobufSourceURL} to ${absolutePathToProtoDirectory}`);
        await loggingExeca(
            this.context.logger,
            "sh",
            [
                "-c",
                `find ${protobufSourceURL} -mindepth 1 -maxdepth 1 -exec cp -r {} ${absolutePathToProtoDirectory}/ \\;`
            ],
            {
                doNotPipeOutput: true
            }
        );
    }

    private async copyRemoteProtobufSource({
        absolutePathToProtoDirectory,
        protobufSourceURL
    }: {
        absolutePathToProtoDirectory: AbsoluteFilePath;
        protobufSourceURL: string;
    }): Promise<void> {
        await this.downloadSource({
            downloadURL: protobufSourceURL,
            destinationPath: PROTOBUF_ZIP_FILENAME
        });

        this.context.logger.debug(`Unzipping source from ${PROTOBUF_ZIP_FILENAME} to ${absolutePathToProtoDirectory}`);
        await loggingExeca(
            this.context.logger,
            "unzip",
            ["-o", PROTOBUF_ZIP_FILENAME, "-d", absolutePathToProtoDirectory],
            {
                doNotPipeOutput: true
            }
        );

        this.context.logger.debug(`Removing ${PROTOBUF_ZIP_FILENAME}`);
        await loggingExeca(this.context.logger, "rm", ["-f", PROTOBUF_ZIP_FILENAME], {
            doNotPipeOutput: true
        });
    }

    private async downloadSource({
        downloadURL,
        destinationPath
    }: {
        downloadURL: string;
        destinationPath: string;
    }): Promise<void> {
        this.context.logger.debug(`Downloading ${downloadURL} to ${destinationPath}`);
        const response = await fetch(downloadURL);
        if (!response.ok) {
            throw new Error(`Failed to download source. Status: ${response.status}, ${response.statusText}`);
        }
        const fileStream = createWriteStream(destinationPath);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await promisify(pipeline)(response.body as any, fileStream);
    }

    async findFiles(absoluteFilePath: AbsoluteFilePath): Promise<RelativeFilePath[]> {
        const absoluteFilePaths: AbsoluteFilePath[] = [];

        const listFiles = async (currentDirectory: AbsoluteFilePath): Promise<void> => {
            const entries = await readdir(currentDirectory, { withFileTypes: true });
            for (const entry of entries) {
                const absoluteFilePath = join(currentDirectory, RelativeFilePath.of(entry.name));
                if (entry.isDirectory()) {
                    await listFiles(absoluteFilePath);
                    continue;
                }
                absoluteFilePaths.push(absoluteFilePath);
            }
        };
        await listFiles(absoluteFilePath);

        return absoluteFilePaths.map((file) => relative(absoluteFilePath, file));
    }

    private isLocalSourceURL(sourceURL: string): boolean {
        return sourceURL.startsWith(LOCAL_FILE_SCHEME);
    }
}
