import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { isRawProtobufSourceSchema, RawSchemas } from "@fern-api/yaml-schema";
import { FernFileContext } from "../FernFileContext";
import { ProtobufParser } from "../parsers/ProtobufParser";
import { ResolvedSource } from "./ResolvedSource";

export interface SourceResolver {
    resolveSource: (args: {
        source: RawSchemas.SourceSchema;
        file: FernFileContext;
    }) => Promise<ResolvedSource | undefined>;
    // resolveSourceOrThrow: (args: { source: RawSchemas.SourceSchema; file: FernFileContext }) => Promise<ResolvedSource>;
}

export class SourceResolverImpl implements SourceResolver {
    private readonly taskContext: TaskContext;
    private readonly workspace: FernWorkspace;
    private readonly sourceCache: Map<AbsoluteFilePath, ResolvedSource>;

    constructor(taskContext: TaskContext, workspace: FernWorkspace) {
        this.taskContext = taskContext;
        this.workspace = workspace;
        this.sourceCache = new Map();
    }

    // public async resolveSourceOrThrow({
    //     source,
    //     file
    // }: {
    //     source: RawSchemas.SourceSchema;
    //     file: FernFileContext;
    // }): Promise<ResolvedSource> {
    //     const resolvedType = await this.resolveSource({ source, file });
    //     if (resolvedType == null) {
    //         const filename = isRawProtobufSourceSchema(source) ? source.proto : source.openapi;
    //         throw new Error(`Cannot resolve source ${filename} from file ${file.relativeFilepath}`);
    //     }
    //     return resolvedType;
    // }

    public async resolveSource({
        source,
        file
    }: {
        source: RawSchemas.SourceSchema;
        file: FernFileContext;
    }): Promise<ResolvedSource | undefined> {
        let resolvedSource: ResolvedSource | undefined;
        if (isRawProtobufSourceSchema(source)) {
            resolvedSource = await this.resolveProtobufSource({ source, file });
        } else {
            resolvedSource = await this.resolveOpenAPISource({ source, file });
        }

        if (resolvedSource == null) {
            const filename = isRawProtobufSourceSchema(source) ? source.proto : source.openapi;
            this.taskContext.logger.warn(`Cannot resolve source ${filename} from file ${file.relativeFilepath}`);
        }

        return resolvedSource;
    }

    private async resolveProtobufSource({
        source,
        file
    }: {
        source: RawSchemas.ProtobufSourceSchema;
        file: FernFileContext;
    }): Promise<ResolvedSource | undefined> {
        const absoluteFilepath = join(this.workspace.absoluteFilepath, RelativeFilePath.of(source.proto));
        if (this.sourceCache.has(absoluteFilepath)) {
            return this.sourceCache.get(absoluteFilepath);
        }
        if (!(await doesPathExist(absoluteFilepath))) {
            return undefined;
        }
        const parser = new ProtobufParser();
        const protobufFileInfo = await parser.parse({ absoluteFilePath: absoluteFilepath });
        const resolvedSource: ResolvedSource = {
            type: "protobuf",
            absoluteFilePath: absoluteFilepath,
            relativeFilePath: RelativeFilePath.of(source.proto),
            csharpNamespace: protobufFileInfo.csharpNamespace,
            packageName: protobufFileInfo.packageName,
            serviceName: protobufFileInfo.serviceName
        };
        this.sourceCache.set(absoluteFilepath, resolvedSource);
        return resolvedSource;
    }

    private async resolveOpenAPISource({
        source,
        file
    }: {
        source: RawSchemas.OpenAPISourceSchema;
        file: FernFileContext;
    }): Promise<ResolvedSource | undefined> {
        const absoluteFilepath = join(this.workspace.absoluteFilepath, RelativeFilePath.of(source.openapi));
        if (this.sourceCache.has(absoluteFilepath)) {
            return this.sourceCache.get(absoluteFilepath);
        }
        if (!(await doesPathExist(absoluteFilepath))) {
            return undefined;
        }
        const resolvedSource: ResolvedSource = {
            type: "openapi",
            absoluteFilePath: absoluteFilepath,
            relativeFilePath: RelativeFilePath.of(source.openapi)
        };
        this.sourceCache.set(absoluteFilepath, resolvedSource);
        return resolvedSource;
    }
}
