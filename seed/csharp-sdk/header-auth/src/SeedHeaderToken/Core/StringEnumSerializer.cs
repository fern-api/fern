using System.Text.Json;
using System.Text.Json.Serialization;

namespace SeedHeaderToken.Core;

internal class StringEnumSerializer<T> : JsonConverter<T>
    where T : IStringEnum
{
    public override T? Read(
        ref Utf8JsonReader reader,
        global::System.Type typeToConvert,
        JsonSerializerOptions options
    )
    {
        var stringValue =
            reader.GetString()
            ?? throw new global::System.Exception("The JSON value could not be read as a string.");
        return (T?)Activator.CreateInstance(typeToConvert, stringValue);
    }

    public override void Write(Utf8JsonWriter writer, T value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.Value);
    }
}
