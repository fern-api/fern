import { Type } from "@fern-api/api";
import {
    assertNever,
    generateTypeReference,
    getOrCreateSourceFile,
    getRelativePathAsModuleSpecifierTo,
    TypeResolver,
} from "@fern-typescript/commons";
import { generateType } from "@fern-typescript/model";
import { Directory, SourceFile, ts } from "ts-morph";

export declare namespace generateWireMessageBodyReference {
    export interface Args {
        typeName: string;
        type: Type;
        docs: string | null | undefined;
        endpointDirectory: Directory;
        modelDirectory: Directory;
        typeResolver: TypeResolver;
    }

    export interface Return {
        file: SourceFile | undefined;
        generateTypeReference: (referencedIn: SourceFile) => ts.TypeNode;
    }
}

export function generateWireMessageBodyReference({
    typeName,
    type,
    docs,
    endpointDirectory,
    modelDirectory,
    typeResolver,
}: generateWireMessageBodyReference.Args): generateWireMessageBodyReference.Return {
    switch (type._type) {
        case "alias": {
            const { aliasOf } = type;
            return {
                file: undefined,
                generateTypeReference: (referencedIn) =>
                    generateTypeReference({
                        reference: aliasOf,
                        referencedIn,
                        modelDirectory,
                    }),
            };
        }
        case "object":
        case "union":
        case "enum": {
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
                file: wireMessageFile,
                generateTypeReference: (referencedIn) => {
                    referencedIn.addImportDeclaration({
                        namedImports: [typeName],
                        moduleSpecifier: getRelativePathAsModuleSpecifierTo(referencedIn, wireMessageFile),
                    });

                    return ts.factory.createTypeReferenceNode(typeName);
                },
            };
        }
        default:
            assertNever(type);
    }
}
