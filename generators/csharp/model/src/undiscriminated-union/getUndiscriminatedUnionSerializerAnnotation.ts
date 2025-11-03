import { BaseCsharpGeneratorContext } from "@fern-api/csharp-base";
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
    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
    context: BaseCsharpGeneratorContext<any>;
    undiscriminatedUnionDeclaration: UndiscriminatedUnionTypeDeclaration;
    isList: boolean;
}): ast.Annotation {
    if (isList) {
        return context.csharp.annotation({
            reference: context.System.Text.Json.Serialization.JsonConverter(),
            argument: context.csharp.codeblock((writer) => {
                writer.write("typeof(");

                const oneOf = context.extern.OneOf.OneOf(
                    undiscriminatedUnionDeclaration.members.map((member) => {
                        return context.csharpTypeMapper.convert({ reference: member.type, unboxOptionals: true });
                    })
                );

                const oneOfSerializer = context.types.OneOfSerializer(oneOf);
                const collectionSerializer = context.types.CollectionItemSerializer(oneOf, oneOfSerializer);
                writer.writeNode(collectionSerializer);
                writer.write(")");
            })
        });
    }
    return context.csharp.annotation({
        reference: context.System.Text.Json.Serialization.JsonConverter(),
        argument: context.csharp.codeblock((writer) => {
            writer.write("typeof(");
            const oneOf = context.extern.OneOf.OneOf(
                undiscriminatedUnionDeclaration.members.map((member) => {
                    return context.csharpTypeMapper.convert({ reference: member.type, unboxOptionals: true });
                })
            );
            const oneOfSerializer = context.types.OneOfSerializer(oneOf);
            writer.writeNode(oneOfSerializer);
            writer.write(")");
        })
    });
}
