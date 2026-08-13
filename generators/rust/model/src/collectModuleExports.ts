import { FernIr } from "@fern-fern/ir-sdk";
import { ModelGeneratorContext } from "./ModelGeneratorContext.js";

/**
 * What caused a module to be generated. Consumers that split the generated
 * models across several crates need this to decide which crate owns each file,
 * since filenames are assigned by the filename registry and cannot be derived
 * from the IR alone.
 */
export type ModuleExportOwner =
    | { kind: "type"; typeId: FernIr.TypeId }
    | { kind: "endpoint"; endpointId: FernIr.EndpointId };

export interface GeneratedModuleExport {
    /** Generated file, e.g. `user_type.rs`. */
    filename: string;
    /** Module name declared in `mod.rs`, i.e. the filename with keywords escaped. */
    moduleName: string;
    /** Type the module re-exports. */
    typeName: string;
    /** Request and response types are counted separately in the module docs. */
    isRequestType: boolean;
    owner: ModuleExportOwner;
}

/**
 * Every module `generateModels` emits, in a stable order, tagged with the IR
 * element that produced it.
 *
 * Filenames and type names come from the context's registries, which are
 * pre-registered against the complete IR. Collision suffixes therefore depend
 * on the whole API, so this must always be called with the full IR even when
 * the caller only intends to emit a subset.
 */
export function collectModuleExports(context: ModelGeneratorContext): GeneratedModuleExport[] {
    const exports: GeneratedModuleExport[] = [];
    // The registry guarantees unique filenames, but a single file can back
    // several IR elements (e.g. an inlined request reusing a named type), and
    // `mod.rs` must declare each module exactly once.
    const seenModuleNames = new Set<string>();

    const addExport = ({
        filename,
        typeName,
        isRequestType,
        owner
    }: {
        filename: string;
        typeName: string;
        isRequestType: boolean;
        owner: ModuleExportOwner;
    }): void => {
        const moduleName = context.escapeRustKeyword(filename.replace(".rs", ""));
        if (seenModuleNames.has(moduleName)) {
            return;
        }
        seenModuleNames.add(moduleName);
        exports.push({ filename, moduleName, typeName, isRequestType, owner });
    };

    for (const [typeId, typeDeclaration] of Object.entries(context.ir.types)) {
        // Variants inlined into a discriminated union do not get their own file.
        if (context.inlinedUnionVariantTypeIds.has(typeId)) {
            continue;
        }
        const typeName = context.getUniqueTypeNameForDeclaration(typeDeclaration);
        addExport({
            filename: context.getUniqueFilenameForType(typeDeclaration),
            typeName,
            isRequestType: typeName.includes("Request") || typeName.includes("Response"),
            owner: { kind: "type", typeId }
        });
    }

    // Endpoint-derived modules are grouped by category rather than by endpoint,
    // which is the order `mod.rs` has always declared them in.
    const endpointCategories: {
        appliesTo: (endpoint: FernIr.HttpEndpoint) => boolean;
        getFilename: (endpointId: FernIr.EndpointId) => string;
        getTypeName: (endpointId: FernIr.EndpointId) => string;
    }[] = [
        {
            appliesTo: (endpoint) => endpoint.requestBody?.type === "inlinedRequestBody",
            getFilename: (endpointId) => context.getFilenameForInlinedRequestBody(endpointId),
            getTypeName: (endpointId) => context.getInlineRequestTypeName(endpointId)
        },
        {
            appliesTo: (endpoint) => endpoint.requestBody?.type === "fileUpload",
            getFilename: (endpointId) => context.getFilenameForFileUploadRequestBody(endpointId),
            getTypeName: (endpointId) => context.getFileUploadRequestTypeName(endpointId)
        },
        {
            appliesTo: (endpoint) => endpoint.queryParameters.length > 0 && !endpoint.requestBody,
            getFilename: (endpointId) => context.getFilenameForQueryRequest(endpointId),
            getTypeName: (endpointId) => context.getQueryRequestUniqueTypeName(endpointId)
        },
        {
            appliesTo: (endpoint) => endpoint.requestBody?.type === "reference" && endpoint.queryParameters.length > 0,
            getFilename: (endpointId) => context.getFilenameForReferencedRequestWithQuery(endpointId),
            getTypeName: (endpointId) => context.getReferencedRequestWithQueryTypeName(endpointId)
        },
        {
            appliesTo: (endpoint) => endpoint.requestBody?.type === "bytes" && endpoint.queryParameters.length > 0,
            getFilename: (endpointId) => context.getFilenameForBytesRequestBody(endpointId),
            getTypeName: (endpointId) => context.getBytesRequestTypeName(endpointId)
        }
    ];

    for (const category of endpointCategories) {
        for (const service of Object.values(context.ir.services)) {
            for (const endpoint of service.endpoints) {
                if (!category.appliesTo(endpoint)) {
                    continue;
                }
                addExport({
                    filename: category.getFilename(endpoint.id),
                    typeName: category.getTypeName(endpoint.id),
                    isRequestType: true,
                    owner: { kind: "endpoint", endpointId: endpoint.id }
                });
            }
        }
    }

    return exports;
}
