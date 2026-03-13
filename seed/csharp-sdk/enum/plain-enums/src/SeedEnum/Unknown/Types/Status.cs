using System.Runtime.Serialization;
using System.Text.Json.Serialization;

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
    public override Status Read(
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
            "Known" => Status.Known,
            "Unknown" => Status.Unknown,
            _ => default,
        };
    }

    public override void Write(
        global::System.Text.Json.Utf8JsonWriter writer,
        Status value,
        global::System.Text.Json.JsonSerializerOptions options
    )
    {
        writer.WriteStringValue(
            value switch
            {
                Status.Known => "Known",
                Status.Unknown => "Unknown",
                _ => throw new global::System.ArgumentOutOfRangeException(
                    nameof(value),
                    value,
                    null
                ),
            }
        );
    }
}
