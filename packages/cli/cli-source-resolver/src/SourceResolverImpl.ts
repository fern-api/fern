import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { RawSchemas, isRawProtobufSourceSchema } from "@fern-api/fern-definition-schema";
import { AbsoluteFilePath, RelativeFilePath, doesPathExistSync, join } from "@fern-api/fs-utils";
import { ResolvedSource, SourceResolver } from "@fern-api/source-resolver";
import { TaskContext } from "@fern-api/task-context";

import { ProtobufParser } from "./parsers/ProtobufParser";

export class SourceResolverImpl implements SourceResolver {
    private readonly context: TaskContext;
    private readonly workspace: FernWorkspace;
    private readonly sourceCache: Map<AbsoluteFilePath, ResolvedSource>;

    constructor(context: TaskContext, workspace: FernWorkspace) {
        this.context = context;
        this.workspace = workspace;
        this.sourceCache = new Map();
    }

    public resolveSourceOrThrow({
        source,
        relativeFilepath
    }: {
        source: RawSchemas.SourceSchema;
        relativeFilepath: RelativeFilePath;
    }): ResolvedSource | undefined {
        const resolvedType = this.resolveSource({ source });
        if (resolvedType == null) {
            if (isRawProtobufSourceSchema(source)) {
                throw new Error(`Cannot resolve source ${source.proto} from file ${relativeFilepath}`);
            }
            // Do not throw if OpenAPI since the source is not actually required.
            this.context.logger.warn(`Cannot resolve source ${source.openapi} from file ${relativeFilepath}`);
        }
        return resolvedType;
    }

    public resolveSource({ source }: { source: RawSchemas.SourceSchema }): ResolvedSource | undefined {
        if (isRawProtobufSourceSchema(source)) {
            return this.resolveProtobufSource({ source });
        }
        return this.resolveOpenAPISource({ source });
    }

    private resolveProtobufSource({ source }: { source: RawSchemas.ProtobufSourceSchema }): ResolvedSource | undefined {
        const absoluteFilepath = join(this.workspace.absoluteFilePath, RelativeFilePath.of(source.proto));
        if (this.sourceCache.has(absoluteFilepath)) {
            return this.sourceCache.get(absoluteFilepath);
        }
        if (!doesPathExistSync(absoluteFilepath)) {
            return undefined;
        }
        const parser = new ProtobufParser();
        const protobufFileInfo = parser.parse({ absoluteFilePath: absoluteFilepath });
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

    private resolveOpenAPISource({ source }: { source: RawSchemas.OpenApiSourceSchema }): ResolvedSource | undefined {
        const absoluteFilepath = join(this.workspace.absoluteFilePath, RelativeFilePath.of(source.openapi));
        if (this.sourceCache.has(absoluteFilepath)) {
            return this.sourceCache.get(absoluteFilepath);
        }
        if (!doesPathExistSync(absoluteFilepath)) {
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
