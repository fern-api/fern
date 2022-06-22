import { Type } from "@fern-api/api";
import { assertNever } from "@fern-api/commons";
import { ModelContext, ServiceTypeMetadata } from "@fern-typescript/commons";
import { generateType } from "@fern-typescript/types";
import { ServiceTypeReference } from "./types";

export declare namespace generateServiceTypeReference {
    export interface Args {
        metadata: ServiceTypeMetadata;
        type: Type;
        docs: string | null | undefined;
        modelContext: ModelContext;
    }
}

export function generateServiceTypeReference({
    metadata,
    type,
    docs,
    modelContext,
}: generateServiceTypeReference.Args): ServiceTypeReference | undefined {
    if (type._type === "alias") {
        switch (type.aliasOf._type) {
            case "named":
            case "primitive":
            case "container":
            case "unknown":
                return {
                    isInlined: false,
                    typeReference: type.aliasOf,
                };
            case "void":
                return undefined;
            default:
                assertNever(type.aliasOf);
        }
    }

    modelContext.addServiceTypeDefinition(metadata, (file) => {
        generateType({
            type,
            docs,
            typeName: metadata.typeName,
            modelContext,
            file,
        });
    });

    return {
        isInlined: true,
        metadata,
    };
}
