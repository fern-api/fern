import { Type } from "@fern-api/api";
import { assertNever } from "@fern-api/commons";
import { TypeResolver } from "@fern-typescript/commons";
import { generateType } from "@fern-typescript/model";
import { Directory } from "ts-morph";
import { ServiceTypeReference } from "./types";
import { getFileNameForServiceType } from "./utils";

export declare namespace generateServiceTypeReference {
    export interface Args<T extends string> {
        typeName: T;
        type: Type;
        docs: string | null | undefined;
        typeDirectory: Directory;
        modelDirectory: Directory;
        typeResolver: TypeResolver;
    }
}

export function generateServiceTypeReference<T extends string>({
    typeName,
    type,
    docs,
    typeDirectory,
    modelDirectory,
    typeResolver,
}: generateServiceTypeReference.Args<T>): ServiceTypeReference<T> | undefined {
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
