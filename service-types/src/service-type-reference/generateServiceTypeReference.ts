import { Type } from "@fern-api/api";
import { assertNever } from "@fern-api/commons";
import { TypeResolver } from "@fern-typescript/commons";
import { generateType } from "@fern-typescript/types";
import { Directory } from "ts-morph";
import { ServiceTypeName, ServiceTypeReference } from "./types";
import { getFileNameForServiceType } from "./utils";

export declare namespace generateServiceTypeReference {
    export interface Args {
        typeName: ServiceTypeName;
        type: Type;
        docs: string | null | undefined;
        typeDirectory: Directory;
        modelDirectory: Directory;
        typeResolver: TypeResolver;
    }
}

export function generateServiceTypeReference({
    typeName,
    type,
    docs,
    typeDirectory,
    modelDirectory,
    typeResolver,
}: generateServiceTypeReference.Args): ServiceTypeReference | undefined {
    if (type._type === "alias") {
        switch (type.aliasOf._type) {
            case "named":
            case "primitive":
            case "container":
                return {
                    isLocal: false,
                    typeReference: type.aliasOf,
                };
            case "void":
                return undefined;
            default:
                assertNever(type.aliasOf);
        }
    }

    const wireMessageFile = typeDirectory.createSourceFile(getFileNameForServiceType(typeName));
    generateType({
        type,
        docs,
        typeName,
        typeResolver,
        modelDirectory,
        file: wireMessageFile,
    });

    return {
        isLocal: true,
        file: wireMessageFile,
        typeName,
    };
}
