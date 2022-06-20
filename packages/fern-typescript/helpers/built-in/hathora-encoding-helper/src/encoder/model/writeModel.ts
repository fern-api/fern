import { Type, TypeDefinition, TypeReference } from "@fern-api/api";
import { FernWriters, getTextOfTsNode, getTypeReference, TypeResolver } from "@fern-typescript/commons";
import { tsMorph } from "@fern-typescript/helper-utils";
import { constructEncodeMethods, EncodeMethods } from "../constructEncodeMethods";
import { NOT_IMPLEMENTED_ENCODE_METHODS } from "../utils";
import { getEncodeMethodsForAlias } from "./getEncodeMethodsForAlias";
import { getEncodeMethodsForEnum } from "./getEncodeMethodsForEnum";
import { getEncodeMethodsForObject } from "./getEncodeMethodsForObject";

export function writeModel({
    types,
    typeResolver,
    file,
    modelDirectory,
}: {
    types: readonly TypeDefinition[];
    typeResolver: TypeResolver;
    file: tsMorph.SourceFile;
    modelDirectory: tsMorph.Directory;
}): tsMorph.WriterFunction {
    const writer = FernWriters.object.writer({ newlinesBetweenProperties: true });

    for (const type of types) {
        writer.addProperty({
            key: type.name.name,
            value: getTextOfTsNode(
                constructEncodeMethods({
                    methods: getEncodeMethodsForType({
                        typeDefinition: type,
                        decodedType: getTypeReference({
                            reference: TypeReference.named(type.name),
                            referencedIn: file,
                            modelDirectory,
                        }),
                        typeResolver,
                        file,
                        modelDirectory,
                    }),
                })
            ),
        });
    }

    return writer.toFunction();
}

export function getEncodeMethodsForType({
    typeDefinition,
    decodedType,
    typeResolver,
    file,
    modelDirectory,
}: {
    typeDefinition: TypeDefinition;
    decodedType: tsMorph.ts.TypeNode;
    typeResolver: TypeResolver;
    file: tsMorph.SourceFile;
    modelDirectory: tsMorph.Directory;
}): EncodeMethods {
    return Type._visit<EncodeMethods>(typeDefinition.shape, {
        alias: (alias) => {
            return getEncodeMethodsForAlias({
                shape: alias,
                decodedType,
                file,
                modelDirectory,
                typeDefinition: typeDefinition,
            });
        },
        enum: () => {
            return getEncodeMethodsForEnum({
                decodedType,
                typeDefinition,
                file,
                modelDirectory,
            });
        },
        object: (object) => {
            return getEncodeMethodsForObject({ object, typeResolver, decodedType });
        },
        union: () => {
            // TODO implement this once IR is more descriptive about union types
            // https://github.com/fern-api/fern/issues/63
            return NOT_IMPLEMENTED_ENCODE_METHODS;
        },
        _unknown: () => {
            throw new Error("Unknown type: " + typeDefinition.shape._type);
        },
    });
}
