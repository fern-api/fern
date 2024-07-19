import { ROOT_API_FILENAME } from "@fern-api/configuration";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { GlobalHeader } from "@fern-api/openapi-ir-sdk";
import { RawSchemas } from "@fern-api/yaml-schema";
import { buildHeader } from "./buildHeader";
import { buildTypeReference } from "./buildTypeReference";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { getTypeFromTypeReference } from "./utils/getTypeFromTypeReference";
import { wrapTypeReferenceAsOptional } from "./utils/wrapTypeReferenceAsOptional";

class HeaderWithCount {
    public readonly schema: RawSchemas.HttpHeaderSchema;
    public count = 0;

    constructor(schema: RawSchemas.HttpHeaderSchema) {
        this.schema = schema;
    }

    public increment(): void {
        this.count += 1;
    }
}

/* 75% of endpoints must have header present, for it to be considered a global header*/
const GLOBAL_HEADER_PERCENTAGE_THRESHOLD = 0.75;

const HEADERS_TO_IGNORE = new Set(...["Authorization"]);

function _isHeaderRequired(header: RawSchemas.TypeReferenceWithDocsSchema): boolean {
    const tString = typeof header === "string" ? header : header.type;
    return tString.includes("optional");
}

export function buildGlobalHeaders(context: OpenApiIrConverterContext): void {
    const predefinedGlobalHeaders: Record<string, GlobalHeader> = Object.fromEntries(
        (context.ir.globalHeaders ?? []).map((header) => [header.header, header])
    );

    const globalHeaders: Record<string, HeaderWithCount> = {};
    const globalHeaderRequirements: Record<string, "required" | "optional" | "both"> = {};
    for (const endpoint of context.ir.endpoints) {
        for (const header of endpoint.headers) {
            if (HEADERS_TO_IGNORE.has(header.name)) {
                continue;
            }

            // If the header is both optional and required, omit it from the global headers.
            // We will deal with it in the endpoint headers.
            const resolvedSchema = buildTypeReference({
                schema: header.schema,
                context,
                fileContainingReference: RelativeFilePath.of("api.yml")
            });
            const headerIsRequired = _isHeaderRequired(resolvedSchema);
            const stashedRequirement = globalHeaderRequirements[header.name];
            if (stashedRequirement == null) {
                globalHeaderRequirements[header.name] = headerIsRequired ? "required" : "optional";
            } else if (stashedRequirement === "required") {
                globalHeaderRequirements[header.name] = headerIsRequired ? "required" : "both";
            } else if (stashedRequirement === "optional") {
                globalHeaderRequirements[header.name] = headerIsRequired ? "both" : "optional";
            }

            let headerWithCount = globalHeaders[header.name];
            if (headerWithCount == null) {
                const predefinedHeader = predefinedGlobalHeaders[header.name];
                const convertedHeader = buildHeader({
                    header: {
                        ...header,
                        schema: predefinedHeader?.schema ?? header.schema,
                        name: predefinedHeader?.name ?? header.name
                    },
                    fileContainingReference: RelativeFilePath.of(ROOT_API_FILENAME),
                    context
                });
                headerWithCount = new HeaderWithCount(convertedHeader);
                globalHeaders[header.name] = headerWithCount;
            }
            headerWithCount.increment();
        }
    }

    const globalHeaderThreshold = context.ir.endpoints.length * GLOBAL_HEADER_PERCENTAGE_THRESHOLD;

    for (const [headerName, header] of Object.entries(predefinedGlobalHeaders)) {
        let schema: RawSchemas.HttpHeaderSchema = "optional<string>";

        if (header.name == null && header.env == null && typeof header.schema === "string") {
            schema = header.schema;
        } else if (header != null) {
            schema = {
                name: header.name,
                env: header.env,
                type:
                    header.schema != null
                        ? getTypeFromTypeReference(
                              buildTypeReference({
                                  schema: header.schema,
                                  context,
                                  fileContainingReference: RelativeFilePath.of("api.yml")
                              })
                          ) ?? "optional<string>"
                        : "optional<string>"
            };
        }
        context.builder.addGlobalHeader({
            name: headerName,
            schema
        });
    }

    for (const [headerName, header] of Object.entries(globalHeaders)) {
        const headerRequirement = globalHeaderRequirements[headerName];
        // The header is required on some endpoints and optional on others
        // forfeit it as a global header and defer it to the endpoint.
        if (headerRequirement === "both") {
            continue;
        }

        const predefinedHeader = predefinedGlobalHeaders[headerName];
        const isRequired = header.count === context.ir.endpoints.length;
        const isOptional = header.count >= globalHeaderThreshold;

        if (predefinedHeader != null) {
            continue; // already added
        } else if (isRequired && headerRequirement === "required") {
            // Only require as a global header if it's required on every endpoint
            context.builder.addGlobalHeader({
                name: headerName,
                schema: header.schema
            });
        } else if ((isRequired || isOptional) && headerRequirement === "optional") {
            // If a header's true type is always optional, we should add it as optional
            context.builder.addGlobalHeader({
                name: headerName,
                schema: wrapTypeReferenceAsOptional(header.schema)
            });
        }
        // If a header is always required and NOT on every endpoint, defer it to be on the endpoint
    }
}
