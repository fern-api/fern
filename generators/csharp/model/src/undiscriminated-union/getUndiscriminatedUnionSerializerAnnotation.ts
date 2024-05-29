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
    undiscriminatedUnionDeclaration
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: AbstractCsharpGeneratorContext<any>;
    undiscriminatedUnionDeclaration: UndiscriminatedUnionTypeDeclaration;
}): csharp.Annotation {
    return csharp.annotation({
        reference: csharp.classReference({
            name: "JsonConverter",
            namespace: "System.Text.Json.Serialization"
        }),
        argument: csharp.codeblock((writer) => {
            writer.write("typeof(");

            writer.writeNode(context.getOneOfSerializerClassReference());
            writer.write("<");

            writer.writeNode(context.getOneOfClassReference());
            writer.write("<");
            undiscriminatedUnionDeclaration.members.forEach((member, idx) => {
                const type = context.csharpTypeMapper.convert({ reference: member.type, unboxOptionals: true });
                writer.writeNode(type);
                if (idx < undiscriminatedUnionDeclaration.members.length - 1) {
                    writer.write(", ");
                }
            });
            writer.write(">");

            writer.write(">");

            writer.write(")");
        })
    });
}
