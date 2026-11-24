import { FERN_PACKAGE_MARKER_FILENAME, ROOT_API_FILENAME } from "@fern-api/configuration";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { GlobalHeader, Header } from "@fern-api/openapi-ir";
import { join, RelativeFilePath } from "@fern-api/path-utils";
import { camelCase } from "lodash-es";
import { buildHeader } from "./buildHeader.js";
import { buildTypeReference } from "./buildTypeReference.js";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext.js";
import { getGroupNameForSchema } from "./utils/getGroupNameForSchema.js";
import { getNamespaceFromGroup } from "./utils/getNamespaceFromGroup.js";
import { getTypeFromTypeReference } from "./utils/getTypeFromTypeReference.js";
import { wrapTypeReferenceAsOptional } from "./utils/wrapTypeReferenceAsOptional.js";

class HeaderWithCount {
    public readonly firstOccurrence: Header;
    public count = 0;

    constructor(firstOccurrence: Header) {
        this.firstOccurrence = firstOccurrence;
    }

    public increment(): void {
        this.count += 1;
    }
}

/* 75% of endpoints must have header present, for it to be considered a global header*/
const GLOBAL_HEADER_PERCENTAGE_THRESHOLD = 0.75;

const HEADERS_TO_IGNORE = new Set(["authorization"]);

export function buildGlobalHeaders(context: OpenApiIrConverterContext): void {
    if (context.globalHeaderOverrides != null) {
        for (const [name, declaration] of Object.entries(context.globalHeaderOverrides.headers ?? {})) {
            context.builder.addGlobalHeader({
                name,
                schema: declaration
            });
        }
        return;
    }

    const predefinedGlobalHeaders: Record<string, GlobalHeader> = Object.fromEntries(
        (context.ir.globalHeaders ?? []).map((header) => [header.header, header])
    );

    for (const [headerName, header] of Object.entries(predefinedGlobalHeaders)) {
        const isOptional = header.optional === true;
        const defaultType = isOptional ? "optional<string>" : "string";
        let schema: RawSchemas.HttpHeaderSchema = defaultType;

        if (
            header.name == null &&
            header.env == null &&
            header.clientDefault == null &&
            typeof header.schema === "string"
        ) {
            schema = header.schema;
        } else if (header != null) {
            const groupName = header.schema ? getGroupNameForSchema(header.schema) : undefined;
            const namespace = groupName != null ? getNamespaceFromGroup(groupName) : undefined;
            const defaultFile = RelativeFilePath.of("api.yml");
            schema = {
                name: header.name,
                env: header.env,
                type:
                    header.schema != null
                        ? (getTypeFromTypeReference(
                              buildTypeReference({
                                  schema: header.schema,
                                  context,
                                  fileContainingReference: namespace
                                      ? join(RelativeFilePath.of(camelCase(namespace)), defaultFile)
                                      : defaultFile,
                                  namespace,
                                  declarationDepth: 0
                              })
                          ) ?? defaultType)
                        : defaultType
            };
            if (typeof header.clientDefault === "string" || typeof header.clientDefault === "boolean") {
                schema["client-default"] = header.clientDefault;
            }
        }
        context.builder.addGlobalHeader({
            name: headerName,
            schema
        });
    }

    if (context.options.detectGlobalHeaders) {
        const globalHeaders: Record<string, HeaderWithCount> = {};
        for (const endpoint of context.ir.endpoints) {
            for (const header of endpoint.headers) {
                if (HEADERS_TO_IGNORE.has(header.name.toLowerCase())) {
                    continue;
                }
                const headerWithCount = globalHeaders[header.name] ?? new HeaderWithCount(header);
                globalHeaders[header.name] = headerWithCount;
                headerWithCount.increment();
            }
        }

        const globalHeaderThreshold = context.ir.endpoints.length * GLOBAL_HEADER_PERCENTAGE_THRESHOLD;

        for (const [headerName, header] of Object.entries(globalHeaders)) {
            const predefinedHeader = predefinedGlobalHeaders[headerName];
            const isRequired = header.count === context.ir.endpoints.length;
            const isOptional = header.count >= globalHeaderThreshold;
            if (predefinedHeader != null || !isOptional) {
                continue;
            }
            const schema = buildDetectedGlobalHeader({ header: header.firstOccurrence, context });
            context.builder.addGlobalHeader({
                name: headerName,
                schema: isRequired ? schema : wrapTypeReferenceAsOptional(schema)
            });
        }
    }
}

/**
 * api.yml cannot hold type declarations, so a detected global header's inline types (for example an
 * inline enum) are declared in the root __package__.yml and imported into api.yml.
 */
function buildDetectedGlobalHeader({
    header,
    context
}: {
    header: Header;
    context: OpenApiIrConverterContext;
}): RawSchemas.HttpHeaderSchema {
    return buildHeader({
        header,
        fileContainingReference: RelativeFilePath.of(ROOT_API_FILENAME),
        declarationFile: RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME),
        context,
        namespace: undefined
    });
}
