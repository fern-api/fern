import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { isRawProtobufSourceSchema, RawSchemas } from "@fern-api/fern-definition-schema";
import { FernFileContext } from "../FernFileContext";
import { ProtobufParser } from "../parsers/ProtobufParser";
import { ResolvedSource } from "./ResolvedSource";

export interface SourceResolver {
    resolveSource: (args: {
        source: RawSchemas.SourceSchema;
        file: FernFileContext;
    }) => Promise<ResolvedSource | undefined>;
    resolveSourceOrThrow: (args: {
        source: RawSchemas.SourceSchema;
        file: FernFileContext;
    }) => Promise<ResolvedSource | undefined>;
}

export class SourceResolverImpl implements SourceResolver {
    private readonly context: TaskContext;
    private readonly workspace: FernWorkspace;
    private readonly sourceCache: Map<AbsoluteFilePath, ResolvedSource>;

    constructor(context: TaskContext, workspace: FernWorkspace) {
        this.context = context;
        this.workspace = workspace;
        this.sourceCache = new Map();
    }

    public async resolveSourceOrThrow({
        source,
        file
    }: {
        source: RawSchemas.SourceSchema;
        file: FernFileContext;
    }): Promise<ResolvedSource | undefined> {
        const resolvedType = await this.resolveSource({ source, file });
        if (resolvedType == null) {
            if (isRawProtobufSourceSchema(source)) {
                throw new Error(`Cannot resolve source ${source.proto} from file ${file.relativeFilepath}`);
            }
            // Do not throw if OpenAPI since the source is not actually required.
            this.context.logger.warn(`Cannot resolve source ${source.openapi} from file ${file.relativeFilepath}`);
        }
        return resolvedType;
    }

    public async resolveSource({
        source,
        file
    }: {
        source: RawSchemas.SourceSchema;
        file: FernFileContext;
    }): Promise<ResolvedSource | undefined> {
        if (isRawProtobufSourceSchema(source)) {
            return await this.resolveProtobufSource({ source, file });
        }
        return await this.resolveOpenAPISource({ source, file });
    }

    private async resolveProtobufSource({
        source,
        file
    }: {
        source: RawSchemas.ProtobufSourceSchema;
        file: FernFileContext;
    }): Promise<ResolvedSource | undefined> {
        const absoluteFilepath = join(this.workspace.absoluteFilePath, RelativeFilePath.of(source.proto));
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
        source: RawSchemas.OpenApiSourceSchema;
        file: FernFileContext;
    }): Promise<ResolvedSource | undefined> {
        const absoluteFilepath = join(this.workspace.absoluteFilePath, RelativeFilePath.of(source.openapi));
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
