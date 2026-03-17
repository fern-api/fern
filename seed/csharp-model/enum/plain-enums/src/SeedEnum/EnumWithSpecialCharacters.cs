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
    private static readonly global::System.Collections.Generic.Dictionary<
        string,
        EnumWithSpecialCharacters
    > _stringToEnum = new()
    {
        { "\\$bla", EnumWithSpecialCharacters.Bla },
        { "\\$yo", EnumWithSpecialCharacters.Yo },
    };

    private static readonly global::System.Collections.Generic.Dictionary<
        EnumWithSpecialCharacters,
        string
    > _enumToString = new()
    {
        { EnumWithSpecialCharacters.Bla, "\\$bla" },
        { EnumWithSpecialCharacters.Yo, "\\$yo" },
    };

    public override EnumWithSpecialCharacters Read(
        ref global::System.Text.Json.Utf8JsonReader reader,
        global::System.Type typeToConvert,
        global::System.Text.Json.JsonSerializerOptions options
    )
    {
        var stringValue =
            reader.GetString()
            ?? throw new global::System.Exception("The JSON value could not be read as a string.");
        return _stringToEnum.TryGetValue(stringValue, out var enumValue) ? enumValue : default;
    }

    public override void Write(
        global::System.Text.Json.Utf8JsonWriter writer,
        EnumWithSpecialCharacters value,
        global::System.Text.Json.JsonSerializerOptions options
    )
    {
        writer.WriteStringValue(
            _enumToString.TryGetValue(value, out var stringValue) ? stringValue : null
        );
    }
}
