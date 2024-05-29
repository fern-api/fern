import { AbstractCsharpGeneratorContext, csharp } from "@fern-api/csharp-codegen";
import { TypeReference } from "@fern-fern/ir-sdk/api";

// For enum references, we must add an annotation to the enum serializer:
// [JsonConverter(typeof(StringEnumSerializer<T>))] where T is the enum
export function getEnumSerializationAnnotation({
    context,
    enumReference
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: AbstractCsharpGeneratorContext<any>;
    enumReference: TypeReference;
}): csharp.Annotation {
    const type = context.csharpTypeMapper.convert({ reference: enumReference, unboxOptionals: true });
    return csharp.annotation({
        reference: csharp.classReference({
            name: "JsonConverter",
            namespace: "System.Text.Json.Serialization"
        }),
        argument: csharp.codeblock((writer) => {
            writer.write("typeof(");
            writer.writeNode(csharp.classReference(context.getStringEnumSerializerClassReference()));
            writer.write("<");
            writer.writeNode(type);
            writer.write(">");
            writer.write(")");
        })
    });
}
