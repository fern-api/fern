import { AbstractCsharpGeneratorContext, csharp } from "@fern-api/csharp-codegen";

import { UndiscriminatedUnionTypeDeclaration } from "@fern-fern/ir-sdk/api";

/**
 * Returns a C# annotation used to deserialize and serialize OneOf references.
 * The generated code would look something like:
 *
 * [JsonConverter(typeof(OneOfSerializer<OneOf<Square, Circle, ...>>))]
 */
export function getUndiscriminatedUnionSerializerAnnotation({
    context,
    undiscriminatedUnionDeclaration,
    isList
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: AbstractCsharpGeneratorContext<any>;
    undiscriminatedUnionDeclaration: UndiscriminatedUnionTypeDeclaration;
    isList: boolean;
}): csharp.Annotation {
    if (isList) {
        return csharp.annotation({
            reference: csharp.classReference({
                name: "JsonConverter",
                namespace: "System.Text.Json.Serialization"
            }),
            argument: csharp.codeblock((writer) => {
                writer.write("typeof(");

                const oneOf = getOneOf({ context, undiscriminatedUnionDeclaration });
                const oneOfSerializer = getOneOfSerializer({ context, undiscriminatedUnionDeclaration });
                const collectionSerializer = context.getCollectionItemSerializerReference(oneOf, oneOfSerializer);
                writer.writeNode(collectionSerializer);
                writer.write(")");
            })
        });
    }
    return csharp.annotation({
        reference: csharp.classReference({
            name: "JsonConverter",
            namespace: "System.Text.Json.Serialization"
        }),
        argument: csharp.codeblock((writer) => {
            writer.write("typeof(");
            const oneOfSerializer = getOneOfSerializer({ context, undiscriminatedUnionDeclaration });
            writer.writeNode(oneOfSerializer);
            writer.write(")");
        })
    });
}

function getOneOfSerializer({
    context,
    undiscriminatedUnionDeclaration
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: AbstractCsharpGeneratorContext<any>;
    undiscriminatedUnionDeclaration: UndiscriminatedUnionTypeDeclaration;
}): csharp.ClassReference {
    const oneOf = getOneOf({ context, undiscriminatedUnionDeclaration });
    return context.getOneOfSerializerClassReference(oneOf);
}

function getOneOf({
    context,
    undiscriminatedUnionDeclaration
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: AbstractCsharpGeneratorContext<any>;
    undiscriminatedUnionDeclaration: UndiscriminatedUnionTypeDeclaration;
}): csharp.ClassReference {
    return context.getOneOfClassReference(
        undiscriminatedUnionDeclaration.members.map((member) => {
            return context.csharpTypeMapper.convert({ reference: member.type, unboxOptionals: true });
        })
    );
}
