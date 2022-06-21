import { Type } from "@fern-api/api";
import { assertNever } from "@fern-api/commons";
import { getOrCreateSourceFile, TypeResolver } from "@fern-typescript/commons";
import { generateType } from "@fern-typescript/types";
import { Directory } from "ts-morph";
import { ServiceTypeMetadata, ServiceTypeReference } from "./types";

export declare namespace generateServiceTypeReference {
    export interface Args {
        metadata: ServiceTypeMetadata;
        type: Type;
        docs: string | null | undefined;
        modelDirectory: Directory;
        typeResolver: TypeResolver;
    }
}

export function generateServiceTypeReference({
    metadata,
    type,
    docs,
    modelDirectory,
    typeResolver,
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

    const file = getOrCreateSourceFile(modelDirectory, metadata.filepath);

    generateType({
        type,
        docs,
        typeName: metadata.typeName,
        typeResolver,
        modelDirectory,
        file,
    });

    return {
        isInlined: true,
        file,
        metadata,
    };
}
