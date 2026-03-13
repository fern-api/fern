using System.Runtime.Serialization;
using System.Text.Json.Serialization;

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
    public override ForwardCompatibleEnum Read(
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
            "active" => ForwardCompatibleEnum.Active,
            "inactive" => ForwardCompatibleEnum.Inactive,
            _ => default,
        };
    }

    public override void Write(
        global::System.Text.Json.Utf8JsonWriter writer,
        ForwardCompatibleEnum value,
        global::System.Text.Json.JsonSerializerOptions options
    )
    {
        writer.WriteStringValue(
            value switch
            {
                ForwardCompatibleEnum.Active => "active",
                ForwardCompatibleEnum.Inactive => "inactive",
                _ => throw new global::System.ArgumentOutOfRangeException(
                    nameof(value),
                    value,
                    null
                ),
            }
        );
    }
}
