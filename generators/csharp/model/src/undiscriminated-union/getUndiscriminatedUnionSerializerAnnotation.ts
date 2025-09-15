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
            reference: context.csharp.System.Text.Json.Serialization.JsonConverter(),
            argument: context.csharp.codeblock((writer) => {
                writer.write("typeof(");

                const oneOf = getOneOf({ context, undiscriminatedUnionDeclaration });
                const oneOfSerializer = getOneOfSerializer({ context, undiscriminatedUnionDeclaration });
                const collectionSerializer = context.getCollectionItemSerializerReference(oneOf, oneOfSerializer);
                writer.writeNode(collectionSerializer);
                writer.write(")");
            })
        });
    }
    return context.csharp.annotation({
        reference: context.csharp.System.Text.Json.Serialization.JsonConverter(),
        argument: context.csharp.codeblock((writer) => {
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
    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
    context: BaseCsharpGeneratorContext<any>;
    undiscriminatedUnionDeclaration: UndiscriminatedUnionTypeDeclaration;
}): ast.ClassReference {
    const oneOf = getOneOf({ context, undiscriminatedUnionDeclaration });
    return context.getOneOfSerializerClassReference(oneOf);
}

function getOneOf({
    context,
    undiscriminatedUnionDeclaration
}: {
    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
    context: BaseCsharpGeneratorContext<any>;
    undiscriminatedUnionDeclaration: UndiscriminatedUnionTypeDeclaration;
}): ast.ClassReference {
    return context.getOneOfClassReference(
        undiscriminatedUnionDeclaration.members.map((member) => {
            return context.csharpTypeMapper.convert({ reference: member.type, unboxOptionals: true });
        })
    );
}
