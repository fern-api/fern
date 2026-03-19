using global::System.Text.Json;
using global::System.Text.Json.Serialization;

namespace <%= namespace%>;

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

    public override T ReadAsPropertyName(
        ref Utf8JsonReader reader,
        global::System.Type typeToConvert,
        JsonSerializerOptions options
    )
    {
        var stringValue =
            reader.GetString()
            ?? throw new global::System.Exception(
                "The JSON property name could not be read as a string."
            );
        return (T?)Activator.CreateInstance(typeToConvert, stringValue)
            ?? throw new global::System.Exception(
                "Could not create an instance of the string enum."
            );
    }

    public override void WriteAsPropertyName(
        Utf8JsonWriter writer,
        T value,
        JsonSerializerOptions options
    )
    {
        writer.WritePropertyName(value.Value);
    }
}
