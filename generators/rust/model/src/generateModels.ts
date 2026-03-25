import { FernIr } from "@fern-fern/ir-sdk";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { BUILD_ERROR_RS, RustFile } from "@fern-api/rust-base";
import { AliasGenerator } from "./alias/index.js";
import { EnumGenerator } from "./enum/index.js";
import { FileUploadRequestBodyGenerator } from "./file-upload-request-body/index.js";
import { InlinedRequestBodyGenerator } from "./inlined-request-body/index.js";
import { ModelGeneratorContext } from "./ModelGeneratorContext.js";
import { StructGenerator } from "./object/index.js";
import { QueryParameterRequestGenerator } from "./query-request/index.js";
import { ReferencedRequestWithQueryGenerator } from "./referenced-request-with-query/index.js";
import { UndiscriminatedUnionGenerator, UnionGenerator } from "./union/index.js";

export function generateModels({ context }: { context: ModelGeneratorContext }): RustFile[] {
    const files: RustFile[] = [];

    // Generate error.rs with BuildError (used by generated builders).
    // In the model generator this becomes src/error.rs directly.
    // In the SDK generator this file is filtered out since the SDK's ErrorGenerator
    // produces its own error.rs that includes both ApiError and BuildError.
    files.push(
        new RustFile({
            filename: "error.rs",
            directory: RelativeFilePath.of("src"),
            fileContents: BUILD_ERROR_RS
        })
    );

    // Pre-compute which type IDs are members of undiscriminated unions.
    // Single-property structs in undiscriminated unions need #[serde(transparent)]
    // so they serialize as the inner value for untagged enum matching.
    for (const [_typeId, typeDeclaration] of Object.entries(context.ir.types)) {
        if (typeDeclaration.shape.type === "undiscriminatedUnion") {
            for (const member of typeDeclaration.shape.members) {
                if (member.type.type === "named") {
                    context.undiscriminatedUnionMemberTypeIds.add(member.type.typeId);
                }
            }
        }
    }

    // Pre-compute which type IDs can be inlined into discriminated union variants.
    // A type can be inlined if it's ONLY referenced as a samePropertiesAsObject in
    // exactly one union variant and nowhere else in the IR.
    computeInlinedUnionVariantTypeIds(context);

    for (const [typeId, typeDeclaration] of Object.entries(context.ir.types)) {
        // Skip generating separate struct files for types inlined into union variants
        if (context.inlinedUnionVariantTypeIds.has(typeId)) {
            continue;
        }

        const file = typeDeclaration.shape._visit<RustFile | undefined>({
            alias: (aliasTypeDeclaration) => {
                return new AliasGenerator(typeDeclaration, aliasTypeDeclaration, context).generate();
            },
            enum: (enumTypeDeclaration) => {
                return new EnumGenerator(typeDeclaration, enumTypeDeclaration, context).generate();
            },
            object: (objectTypeDeclaration) => {
                return new StructGenerator(typeDeclaration, objectTypeDeclaration, context).generate();
            },
            union: (unionTypeDeclaration) => {
                return new UnionGenerator(typeDeclaration, unionTypeDeclaration, context).generate();
            },
            undiscriminatedUnion: (undiscriminatedUnionTypeDeclaration) => {
                return new UndiscriminatedUnionGenerator(
                    typeDeclaration,
                    undiscriminatedUnionTypeDeclaration,
                    context
                ).generate();
            },
            _other: () => {
                // Unknown type shape, skip for now
                return undefined;
            }
        });

        if (file != null) {
            files.push(file);
        }
    }

    // Generate inlined request body types from services
    const inlinedRequestBodyGenerator = new InlinedRequestBodyGenerator(context);
    files.push(...inlinedRequestBodyGenerator.generateFiles());

    // Generate file upload request body types from services
    const fileUploadRequestBodyGenerator = new FileUploadRequestBodyGenerator(context);
    files.push(...fileUploadRequestBodyGenerator.generateFiles());

    // Generate query parameter request structs for query-only endpoints
    const queryRequestGenerator = new QueryParameterRequestGenerator(context);
    files.push(...queryRequestGenerator.generateFiles());

    // Generate request types for endpoints with referenced body + query parameters
    const referencedRequestWithQueryGenerator = new ReferencedRequestWithQueryGenerator(context);
    files.push(...referencedRequestWithQueryGenerator.generateFiles());

    // Deduplicate files by filename to prevent file collisions
    // This is a safety net for tracing logs - ideally generators shouldn't create duplicates
    const seenFilenames = new Map<string, string>();
    const deduplicatedFiles: RustFile[] = [];

    for (const file of files) {
        const fullPath = `${file.directory}/${file.filename}`;

        if (seenFilenames.has(fullPath)) {
            const firstSource = seenFilenames.get(fullPath);
            context.logger.error(
                `DUPLICATE FILE DETECTED: ${fullPath}\n` +
                    `  First generated by: ${firstSource}\n` +
                    `  Duplicate attempt: (current iteration)\n` +
                    `  This indicates a bug in the generator - the same file should not be generated twice!`
            );
            continue;
        }

        // Track which generator created this file for debugging
        const source = fullPath.includes("inline_")
            ? "InlinedRequestBodyGenerator"
            : fullPath.includes("query")
              ? "QueryParameterRequestGenerator"
              : "IRTypeGenerator";
        seenFilenames.set(fullPath, source);
        deduplicatedFiles.push(file);
    }

    if (seenFilenames.size < files.length) {
        const duplicateCount = files.length - seenFilenames.size;
        context.logger.warn(
            `Removed ${duplicateCount} duplicate file(s) to prevent corruption. ` +
                `This is a generator bug that should be fixed!`
        );
    }

    return deduplicatedFiles;
}

/**
 * Counts how many times each typeId is referenced across the entire IR,
 * then determines which types can be inlined into union variants.
 *
 * A type can be inlined if:
 * 1. It appears as a samePropertiesAsObject in exactly one union variant
 * 2. It is not referenced anywhere else in the IR (object fields, other unions,
 *    service endpoints, aliases, containers, etc.)
 * 3. It is an object type (not an enum, alias, or another union)
 */
function computeInlinedUnionVariantTypeIds(context: ModelGeneratorContext): void {
    const ir = context.ir;

    // Count all references to each typeId across the IR
    const referenceCount = new Map<string, number>();
    // Track which typeIds are referenced as samePropertiesAsObject in unions
    const samePropertiesRefs = new Set<string>();

    function countTypeRef(typeRef: FernIr.TypeReference): void {
        if (typeRef.type === "named") {
            referenceCount.set(typeRef.typeId, (referenceCount.get(typeRef.typeId) ?? 0) + 1);
        } else if (typeRef.type === "container") {
            typeRef.container._visit({
                optional: (inner) => countTypeRef(inner),
                nullable: (inner) => countTypeRef(inner),
                list: (inner) => countTypeRef(inner),
                set: (inner) => countTypeRef(inner),
                map: (mapType) => {
                    countTypeRef(mapType.keyType);
                    countTypeRef(mapType.valueType);
                },
                literal: () => {},
                _other: () => {}
            });
        }
    }

    // Count references in all type declarations
    for (const [_typeId, typeDecl] of Object.entries(ir.types)) {
        typeDecl.shape._visit({
            object: (obj) => {
                for (const prop of obj.properties) {
                    countTypeRef(prop.valueType);
                }
                for (const ext of obj.extends) {
                    referenceCount.set(ext.typeId, (referenceCount.get(ext.typeId) ?? 0) + 1);
                }
            },
            union: (union) => {
                for (const prop of union.baseProperties) {
                    countTypeRef(prop.valueType);
                }
                for (const variant of union.types) {
                    variant.shape._visit({
                        samePropertiesAsObject: (ref) => {
                            referenceCount.set(ref.typeId, (referenceCount.get(ref.typeId) ?? 0) + 1);
                            samePropertiesRefs.add(ref.typeId);
                        },
                        singleProperty: (prop) => countTypeRef(prop.type),
                        noProperties: () => {},
                        _other: () => {}
                    });
                }
            },
            undiscriminatedUnion: (uu) => {
                for (const member of uu.members) {
                    countTypeRef(member.type);
                }
            },
            alias: (alias) => {
                countTypeRef(alias.aliasOf);
            },
            enum: () => {},
            _other: () => {}
        });
    }

    // Count references in services (endpoint request/response types)
    for (const service of Object.values(ir.services)) {
        for (const endpoint of service.endpoints) {
            // Request body types
            if (endpoint.requestBody) {
                endpoint.requestBody._visit({
                    reference: (ref) => countTypeRef(ref.requestBodyType),
                    inlinedRequestBody: (inlined) => {
                        for (const prop of inlined.properties) {
                            countTypeRef(prop.valueType);
                        }
                        for (const ext of inlined.extends) {
                            referenceCount.set(ext.typeId, (referenceCount.get(ext.typeId) ?? 0) + 1);
                        }
                    },
                    fileUpload: () => {},
                    bytes: () => {},
                    _other: () => {}
                });
            }

            // Response body type
            if (endpoint.response?.body) {
                endpoint.response.body._visit({
                    json: (jsonResponse) => countTypeRef(jsonResponse.responseBodyType),
                    streaming: () => {},
                    fileDownload: () => {},
                    text: () => {},
                    bytes: () => {},
                    streamParameter: () => {},
                    _other: () => {}
                });
            }

            // Error types (look up the error declaration to get the type reference)
            for (const responseError of endpoint.errors) {
                const errorDecl = ir.errors[responseError.error.errorId];
                if (errorDecl?.type) {
                    countTypeRef(errorDecl.type);
                }
            }

            // Path parameters, query parameters, headers
            for (const param of endpoint.pathParameters) {
                countTypeRef(param.valueType);
            }
            for (const param of endpoint.queryParameters) {
                countTypeRef(param.valueType);
            }
            for (const header of endpoint.headers) {
                countTypeRef(header.valueType);
            }
        }
    }

    // Count references in error declarations
    if (ir.errors) {
        for (const errorDecl of Object.values(ir.errors)) {
            if (errorDecl.type) {
                countTypeRef(errorDecl.type);
            }
        }
    }

    // Determine which types can be inlined:
    // - Referenced exactly once (the samePropertiesAsObject reference)
    // - That one reference is as samePropertiesAsObject
    // - The type is an object (not enum, alias, or union)
    for (const typeId of samePropertiesRefs) {
        const count = referenceCount.get(typeId) ?? 0;
        if (count === 1) {
            const typeDecl = ir.types[typeId];
            if (typeDecl?.shape.type === "object") {
                context.inlinedUnionVariantTypeIds.add(typeId);
            }
        }
    }
}
