import { AbstractCsharpGeneratorContext, csharp } from "@fern-api/csharp-codegen";

// For enum references, we must add an annotation to the enum serializer:
// [JsonConverter(typeof(StringEnumSerializer<T>))] where T is the enum
export function getEnumSerializationAnnotation({
    context,
    type
}: {
    context: AbstractCsharpGeneratorContext<any>;
    type: csharp.Type;
}): csharp.Annotation {
    return csharp.annotation({
        reference: csharp.classReference({
            name: "JsonConverter",
            namespace: "System.Text.Json.Serialization"
        }),
        argument: csharp.codeblock((writer) => {
            writer.write("typeof(");
            writer.writeNodeStatement(csharp.classReference(context.getStringEnumSerializerClassReference()));
            writer.write("<");
            writer.writeNodeStatement(type);
            writer.write(">");
            writer.write(")");
        })
    });
}
