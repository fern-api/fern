import { Type } from "@fern-api/api";
import { assertNever } from "@fern-api/commons";
import { getOrCreateSourceFile, getRelativePathAsModuleSpecifierTo, TypeResolver } from "@fern-typescript/commons";
import { generateType } from "@fern-typescript/model";
import { Directory, ts } from "ts-morph";
import { WireMessageBodyReference } from "./types";

export declare namespace generateWireMessageBodyReference {
    export interface Args {
        typeName: string;
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
                // generate an new file for this aliased type
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
        typeName: ts.factory.createIdentifier(typeName),
        generateTypeReference: (referencedIn) => {
            referencedIn.addImportDeclaration({
                namedImports: [typeName],
                moduleSpecifier: getRelativePathAsModuleSpecifierTo(referencedIn, wireMessageFile),
            });
            return ts.factory.createTypeReferenceNode(typeName);
        },
    };
}
