import { GeneratorContext } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";

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
    context: GeneratorContext;
    undiscriminatedUnionDeclaration: UndiscriminatedUnionTypeDeclaration;
    isList: boolean;
}): ast.Annotation {
    if (isList) {
        return context.generation.csharp.annotation({
            reference: context.generation.System.Text.Json.Serialization.JsonConverter(),
            argument: context.generation.csharp.codeblock((writer) => {
                writer.write("typeof(");

                const oneOf = context.generation.OneOf.OneOf(
                    undiscriminatedUnionDeclaration.members.map((member) => {
                        return context.csharpTypeMapper.convert({ reference: member.type, unboxOptionals: true });
                    })
                );

                const oneOfSerializer = context.generation.Types.OneOfSerializer(oneOf);
                const collectionSerializer = context.generation.Types.CollectionItemSerializer(oneOf, oneOfSerializer);
                writer.writeNode(collectionSerializer);
                writer.write(")");
            })
        });
    }
    return context.generation.csharp.annotation({
        reference: context.generation.System.Text.Json.Serialization.JsonConverter(),
        argument: context.generation.csharp.codeblock((writer) => {
            writer.write("typeof(");
            const oneOf = context.generation.OneOf.OneOf(
                undiscriminatedUnionDeclaration.members.map((member) => {
                    return context.csharpTypeMapper.convert({ reference: member.type, unboxOptionals: true });
                })
            );
            const oneOfSerializer = context.generation.Types.OneOfSerializer(oneOf);
            writer.writeNode(oneOfSerializer);
            writer.write(")");
        })
    });
}
