import { WireMessage } from "@fern-api/api";
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
        wireMessage: WireMessage;
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
    wireMessage,
    endpointDirectory,
    modelDirectory,
    typeResolver,
}: generateWireMessageBodyReference.Args): generateWireMessageBodyReference.Return {
    switch (wireMessage.type._type) {
        case "alias": {
            const { aliasOf } = wireMessage.type;
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
                type: wireMessage.type,
                docs: wireMessage.docs,
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
            assertNever(wireMessage.type);
    }
}
