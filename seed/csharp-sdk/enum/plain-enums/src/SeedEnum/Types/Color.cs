using System.Runtime.Serialization;
using System.Text.Json.Serialization;

namespace SeedEnum;

[JsonConverter(typeof(ColorSerializer))]
public enum Color
{
    [EnumMember(Value = "red")]
    Red,

    [EnumMember(Value = "blue")]
    Blue,
}

internal class ColorSerializer : global::System.Text.Json.Serialization.JsonConverter<Color>
{
    public override Color Read(
        ref global::System.Text.Json.Utf8JsonReader reader,
        global::System.Type typeToConvert,
        global::System.Text.Json.JsonSerializerOptions options
    )
    {
        var stringValue =
            reader.GetString()
            ?? throw new global::System.Exception("The JSON value could not be read as a string.");
        return stringValue switch
        {
            "red" => Color.Red,
            "blue" => Color.Blue,
            _ => default,
        };
    }

    public override void Write(
        global::System.Text.Json.Utf8JsonWriter writer,
        Color value,
        global::System.Text.Json.JsonSerializerOptions options
    )
    {
        writer.WriteStringValue(
            value switch
            {
                Color.Red => "red",
                Color.Blue => "blue",
                _ => throw new global::System.ArgumentOutOfRangeException(
                    nameof(value),
                    value,
                    null
                ),
            }
        );
    }
}
