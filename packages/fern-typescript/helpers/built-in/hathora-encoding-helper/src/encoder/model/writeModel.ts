import { Type, TypeDefinition, TypeReference } from "@fern-api/api";
import { FernWriters, generateTypeReference, getTextOfTsNode, TypeResolver } from "@fern-typescript/commons";
import { tsMorph } from "@fern-typescript/helper-utils";
import { constructEncodeMethods, EncodeMethods } from "../constructEncodeMethods";
import { getEncodeMethodsForAlias } from "./getEncodeMethodsForAlias";
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

function getEncodeMethodsForType({
    typeDefinition,
    typeResolver,
    file,
    modelDirectory,
}: {
    typeDefinition: TypeDefinition;
    typeResolver: TypeResolver;
    file: tsMorph.SourceFile;
    modelDirectory: tsMorph.Directory;
}): EncodeMethods {
    const decodedType = generateTypeReference({
        reference: TypeReference.named(typeDefinition.name),
        referencedIn: file,
        modelDirectory,
    });
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
            return { decodedType, encode: { statements: [] }, decode: { statements: [] } };
        },
        object: (object) => {
            return getEncodeMethodsForObject({ object, typeResolver, decodedType });
        },
        union: () => {
            return { decodedType, encode: { statements: [] }, decode: { statements: [] } };
        },
        _unknown: () => {
            throw new Error("Unknown type: " + typeDefinition.shape._type);
        },
    });
}
