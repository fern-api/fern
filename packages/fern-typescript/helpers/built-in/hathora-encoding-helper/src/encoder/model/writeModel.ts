import { Type, TypeDefinition, TypeReference } from "@fern-api/api";
import { FernWriters, generateTypeReference, TypeResolver } from "@fern-typescript/commons";
import { createPrinter, TsMorph, tsMorph } from "@fern-typescript/helper-utils";
import { constructEncodeMethods, EncodeMethods } from "../constructEncodeMethods";
import { getEncodeMethodsForObject } from "./getEncodeMethodsForObject";

export function writeModel({
    types,
    tsMorph,
    typeResolver,
    file,
    modelDirectory,
}: {
    types: readonly TypeDefinition[];
    tsMorph: TsMorph;
    typeResolver: TypeResolver;
    file: tsMorph.SourceFile;
    modelDirectory: tsMorph.Directory;
}): tsMorph.WriterFunction {
    const printNode = createPrinter(tsMorph);
    const writer = FernWriters.object.writer({ newlinesBetweenProperties: true });

    for (const type of types) {
        writer.addProperty({
            key: type.name.name,
            value: printNode(
                constructEncodeMethods({
                    methods: getEncodeMethodsForType({ type, ts: tsMorph.ts, typeResolver, file, modelDirectory }),
                    ts: tsMorph.ts,
                })
            ),
        });
    }

    return writer.toFunction();
}

function getEncodeMethodsForType({
    type,
    typeResolver,
    file,
    modelDirectory,
    ts,
}: {
    type: TypeDefinition;
    ts: TsMorph["ts"];
    typeResolver: TypeResolver;
    file: tsMorph.SourceFile;
    modelDirectory: tsMorph.Directory;
}): EncodeMethods {
    const decodedType = generateTypeReference({
        reference: TypeReference.named(type.name),
        referencedIn: file,
        modelDirectory,
        factory: ts.factory,
        SyntaxKind: ts.SyntaxKind,
    });
    return Type._visit<EncodeMethods>(type.shape, {
        alias: () => {
            return { decodedType, encode: { statements: [] }, decode: { statements: [] } };
        },
        enum: () => {
            return { decodedType, encode: { statements: [] }, decode: { statements: [] } };
        },
        object: (object) => {
            return getEncodeMethodsForObject({ object, typeResolver, decodedType, ts });
        },
        union: () => {
            return { decodedType, encode: { statements: [] }, decode: { statements: [] } };
        },
        _unknown: () => {
            throw new Error("Unknown type: " + type.shape._type);
        },
    });
}
