using global::System.Runtime.Serialization;
using global::System.Text.Json.Serialization;

namespace SeedEnum;

[JsonConverter(typeof(StatusSerializer))]
public enum Status
{
    [EnumMember(Value = "Known")]
    Known,

    [EnumMember(Value = "Unknown")]
    Unknown,
}

internal class StatusSerializer : global::System.Text.Json.Serialization.JsonConverter<Status>
{
    private static readonly global::System.Collections.Generic.Dictionary<
        string,
        Status
    > _stringToEnum = new() { { "Known", Status.Known }, { "Unknown", Status.Unknown } };

    private static readonly global::System.Collections.Generic.Dictionary<
        Status,
        string
    > _enumToString = new() { { Status.Known, "Known" }, { Status.Unknown, "Unknown" } };

    public override Status Read(
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
        Status value,
        global::System.Text.Json.JsonSerializerOptions options
    )
    {
        writer.WriteStringValue(
            _enumToString.TryGetValue(value, out var stringValue) ? stringValue : null
        );
    }

    public override Status ReadAsPropertyName(
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
        Status value,
        global::System.Text.Json.JsonSerializerOptions options
    )
    {
        writer.WritePropertyName(
            _enumToString.TryGetValue(value, out var stringValue) ? stringValue : value.ToString()
        );
    }
}
