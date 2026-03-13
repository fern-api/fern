using System.Runtime.Serialization;
using System.Text.Json.Serialization;

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
    public override EnumWithCustom Read(
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
            "safe" => EnumWithCustom.Safe,
            "Custom" => EnumWithCustom.Custom,
            _ => default,
        };
    }

    public override void Write(
        global::System.Text.Json.Utf8JsonWriter writer,
        EnumWithCustom value,
        global::System.Text.Json.JsonSerializerOptions options
    )
    {
        writer.WriteStringValue(
            value switch
            {
                EnumWithCustom.Safe => "safe",
                EnumWithCustom.Custom => "Custom",
                _ => throw new global::System.ArgumentOutOfRangeException(
                    nameof(value),
                    value,
                    null
                ),
            }
        );
    }
}
