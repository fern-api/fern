using global::System.Runtime.Serialization;
using global::System.Text.Json.Serialization;

namespace SeedEnum;

[JsonConverter(typeof(EnumWithCustomSerializer))]
public enum EnumWithCustom
{
    [EnumMember(Value = "safe")]
    Safe,

    [EnumMember(Value = "Custom")]
    Custom,
}

internal class EnumWithCustomSerializer
    : global::System.Text.Json.Serialization.JsonConverter<EnumWithCustom>
{
    private static readonly global::System.Collections.Generic.Dictionary<
        string,
        EnumWithCustom
    > _stringToEnum = new()
    {
        { "safe", EnumWithCustom.Safe },
        { "Custom", EnumWithCustom.Custom },
    };

    private static readonly global::System.Collections.Generic.Dictionary<
        EnumWithCustom,
        string
    > _enumToString = new()
    {
        { EnumWithCustom.Safe, "safe" },
        { EnumWithCustom.Custom, "Custom" },
    };

    public override EnumWithCustom Read(
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
        EnumWithCustom value,
        global::System.Text.Json.JsonSerializerOptions options
    )
    {
        writer.WriteStringValue(
            _enumToString.TryGetValue(value, out var stringValue) ? stringValue : null
        );
    }

    public override EnumWithCustom ReadAsPropertyName(
        ref global::System.Text.Json.Utf8JsonReader reader,
        global::System.Type typeToConvert,
        global::System.Text.Json.JsonSerializerOptions options
    )
    {
        var stringValue =
            reader.GetString()
            ?? throw new global::System.Exception(
                "The JSON property name could not be read as a string."
            );
        return _stringToEnum.TryGetValue(stringValue, out var enumValue) ? enumValue : default;
    }

    public override void WriteAsPropertyName(
        global::System.Text.Json.Utf8JsonWriter writer,
        EnumWithCustom value,
        global::System.Text.Json.JsonSerializerOptions options
    )
    {
        writer.WritePropertyName(
            _enumToString.TryGetValue(value, out var stringValue) ? stringValue : value.ToString()
        );
    }
}
