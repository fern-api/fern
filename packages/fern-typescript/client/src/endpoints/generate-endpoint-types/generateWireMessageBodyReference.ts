import { Type } from "@fern-api/api";
import { assertNever } from "@fern-api/commons";
import { getOrCreateSourceFile, TypeResolver } from "@fern-typescript/commons";
import { generateType } from "@fern-typescript/model";
import { Directory } from "ts-morph";
import { EndpointTypeName } from "../generateEndpointTypeReference";
import { WireMessageBodyReference } from "./types";

export declare namespace generateWireMessageBodyReference {
    export interface Args {
        typeName: EndpointTypeName;
        type: Type;
        docs: string | null | undefined;
        endpointDirectory: Directory;
        modelDirectory: Directory;
        typeResolver: TypeResolver;
    }
}

export function generateWireMessageBodyReference({
    typeName,
    type,
    docs,
    endpointDirectory,
    modelDirectory,
    typeResolver,
}: generateWireMessageBodyReference.Args): WireMessageBodyReference | undefined {
    if (type._type === "alias") {
        switch (type.aliasOf._type) {
            case "named":
            case "primitive":
                return {
                    isLocal: false,
                    typeReference: type.aliasOf,
                };
            case "container":
                // generate a new file for this aliased type
                break;
            case "void":
                return undefined;
            default:
                assertNever(type.aliasOf);
        }
    }

    const wireMessageFile = getOrCreateSourceFile(endpointDirectory, `${typeName}.ts`);
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
        typeName,
    };
}
