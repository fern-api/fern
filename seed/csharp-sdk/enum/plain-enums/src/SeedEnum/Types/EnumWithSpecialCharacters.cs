using System.Runtime.Serialization;
using System.Text.Json.Serialization;

namespace SeedEnum;

[JsonConverter(typeof(EnumWithSpecialCharactersSerializer))]
public enum EnumWithSpecialCharacters
{
    [EnumMember(Value = "\\$bla")]
    Bla,

    [EnumMember(Value = "\\$yo")]
    Yo,
}

internal class EnumWithSpecialCharactersSerializer
    : global::System.Text.Json.Serialization.JsonConverter<EnumWithSpecialCharacters>
{
    public override EnumWithSpecialCharacters Read(
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
            "\\$bla" => EnumWithSpecialCharacters.Bla,
            "\\$yo" => EnumWithSpecialCharacters.Yo,
            _ => default,
        };
    }

    public override void Write(
        global::System.Text.Json.Utf8JsonWriter writer,
        EnumWithSpecialCharacters value,
        global::System.Text.Json.JsonSerializerOptions options
    )
    {
        writer.WriteStringValue(
            value switch
            {
                EnumWithSpecialCharacters.Bla => "\\$bla",
                EnumWithSpecialCharacters.Yo => "\\$yo",
                _ => throw new global::System.ArgumentOutOfRangeException(
                    nameof(value),
                    value,
                    null
                ),
            }
        );
    }
}
