import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { ApiDefinitionSource, SourceConfig } from "@fern-api/ir-sdk";
import { loggingExeca } from "@fern-api/logging-execa";
import { InteractiveTaskContext } from "@fern-api/task-context";
import { FernWorkspace, IdentifiableSource } from "@fern-api/workspace-loader";
import { FernRegistry as FdrAPI } from "@fern-fern/fdr-cjs-sdk";
import { readFile, unlink } from "fs/promises";
import tmp from "tmp-promise";

const PROTOBUF_ZIP_FILENAME = "proto.zip";

export type SourceType = "asyncapi" | "openapi" | "protobuf";

export class SourceUploader {
    private context: InteractiveTaskContext;
    private sources: Record<string, IdentifiableSource>;
    private sourceTypes: Set<SourceType>;

    constructor(context: InteractiveTaskContext, workspace: FernWorkspace) {
        this.context = context;
        this.sources = Object.fromEntries(workspace.getSources().map((source) => [source.id, source]));
        this.sourceTypes = new Set<SourceType>(Object.values(this.sources).map((source) => source.type));
    }

    public getSourceTypes(): Set<SourceType> {
        return this.sourceTypes;
    }

    public getFdrApiDefinitionSources():
        | Record<FdrAPI.api.v1.register.SourceId, FdrAPI.api.v1.register.Source>
        | undefined {
        if (Object.keys(this.sources).length === 0) {
            return undefined;
        }
        return Object.fromEntries(
            Object.entries(this.sources).map(([id, source]) => [
                id,
                {
                    type: source.type === "protobuf" ? "proto" : source.type
                }
            ])
        );
    }

    public convertFdrSourceUploadsToSourceConfig(
        sources: Record<FdrAPI.api.v1.register.SourceId, FdrAPI.api.v1.register.SourceUpload>
    ): SourceConfig {
        const apiDefinitionSources: ApiDefinitionSource[] = [];
        for (const [id, sourceUpload] of Object.entries(sources)) {
            const identifiableSource = this.getSourceOrThrow(id);
            switch (identifiableSource.type) {
                case "protobuf":
                    apiDefinitionSources.push(
                        ApiDefinitionSource.proto({
                            id,
                            protoRootUrl: sourceUpload.downloadUrl
                        })
                    );
                    continue;
                case "openapi":
                    apiDefinitionSources.push(ApiDefinitionSource.openapi());
                    continue;
                case "asyncapi":
                    // AsyncAPI sources aren't modeled in the IR yet.
                    continue;
            }
        }
        return {
            sources: apiDefinitionSources
        };
    }

    public async uploadSources(
        sources: Record<FdrAPI.api.v1.register.SourceId, FdrAPI.api.v1.register.SourceUpload>
    ): Promise<void> {
        for (const [id, source] of Object.entries(sources)) {
            const identifiableSource = this.getSourceOrThrow(id);
            await this.uploadSource(identifiableSource, source.uploadUrl);
        }
    }

    private async uploadSource(source: IdentifiableSource, uploadURL: string): Promise<void> {
        const uploadCommand = await this.getUploadCommand(source);
        const fileData = await readFile(uploadCommand.absoluteFilePath);
        const response = await fetch(uploadURL, {
            method: "PUT",
            body: fileData,
            headers: {
                "Content-Type": "application/octet-stream"
            }
        });
        await uploadCommand.cleanup();
        if (!response.ok) {
            this.context.failAndThrow(
                `Failed to upload source file: ${source.absoluteFilePath}. Status: ${response.status}, ${response.statusText}`
            );
        }
    }

    private async getUploadCommand(
        source: IdentifiableSource
    ): Promise<{ absoluteFilePath: AbsoluteFilePath; cleanup: () => Promise<void> }> {
        if (source.type === "protobuf") {
            const absoluteFilePath = await this.zipSource(source.absoluteFilePath);
            return {
                absoluteFilePath,
                cleanup: async () => {
                    this.context.logger.debug(`Removing ${absoluteFilePath}`);
                    await unlink(absoluteFilePath);
                }
            };
        }
        return {
            absoluteFilePath: source.absoluteFilePath,
            cleanup: async () => {}
        };
    }

    private async zipSource(absolutePathToSource: AbsoluteFilePath): Promise<AbsoluteFilePath> {
        const tmpDir = await tmp.dir();
        const destination = join(AbsoluteFilePath.of(tmpDir.path), RelativeFilePath.of(PROTOBUF_ZIP_FILENAME));

        this.context.logger.debug(`Zipping source ${absolutePathToSource} into ${destination}`);
        await loggingExeca(this.context.logger, "zip", ["-r", destination, "."], {
            cwd: absolutePathToSource,
            doNotPipeOutput: true
        });

        return destination;
    }

    private getSourceOrThrow(id: string): IdentifiableSource {
        const source = this.sources[id];
        if (source == null) {
            this.context.failAndThrow(
                `Internal error; server responded with source id "${id}" which does not exist in the workspace.`
            );
        }
        return source;
    }
}
