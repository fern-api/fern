using global::System.Runtime.Serialization;
using global::System.Text.Json.Serialization;

namespace SeedEnum;

[JsonConverter(typeof(ForwardCompatibleEnumSerializer))]
public enum ForwardCompatibleEnum
{
    [EnumMember(Value = "active")]
    Active,

    [EnumMember(Value = "inactive")]
    Inactive,
}

internal class ForwardCompatibleEnumSerializer
    : global::System.Text.Json.Serialization.JsonConverter<ForwardCompatibleEnum>
{
    private static readonly global::System.Collections.Generic.Dictionary<
        string,
        ForwardCompatibleEnum
    > _stringToEnum = new()
    {
        { "active", ForwardCompatibleEnum.Active },
        { "inactive", ForwardCompatibleEnum.Inactive },
    };

    private static readonly global::System.Collections.Generic.Dictionary<
        ForwardCompatibleEnum,
        string
    > _enumToString = new()
    {
        { ForwardCompatibleEnum.Active, "active" },
        { ForwardCompatibleEnum.Inactive, "inactive" },
    };

    public override ForwardCompatibleEnum Read(
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
        ForwardCompatibleEnum value,
        global::System.Text.Json.JsonSerializerOptions options
    )
    {
        writer.WriteStringValue(
            _enumToString.TryGetValue(value, out var stringValue) ? stringValue : null
        );
    }

    public override ForwardCompatibleEnum ReadAsPropertyName(
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
        ForwardCompatibleEnum value,
        global::System.Text.Json.JsonSerializerOptions options
    )
    {
        writer.WritePropertyName(
            _enumToString.TryGetValue(value, out var stringValue) ? stringValue : value.ToString()
        );
    }
}
