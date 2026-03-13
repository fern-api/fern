using System.Runtime.Serialization;
using System.Text.Json.Serialization;

namespace SeedEnum;

[JsonConverter(typeof(OperandSerializer))]
public enum Operand
{
    [EnumMember(Value = ">")]
    GreaterThan,

    [EnumMember(Value = "=")]
    EqualTo,

    [EnumMember(Value = "less_than")]
    LessThan,
}

internal class OperandSerializer : global::System.Text.Json.Serialization.JsonConverter<Operand>
{
    public override Operand Read(
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
            ">" => Operand.GreaterThan,
            "=" => Operand.EqualTo,
            "less_than" => Operand.LessThan,
            _ => default,
        };
    }

    public override void Write(
        global::System.Text.Json.Utf8JsonWriter writer,
        Operand value,
        global::System.Text.Json.JsonSerializerOptions options
    )
    {
        writer.WriteStringValue(
            value switch
            {
                Operand.GreaterThan => ">",
                Operand.EqualTo => "=",
                Operand.LessThan => "less_than",
                _ => throw new global::System.ArgumentOutOfRangeException(
                    nameof(value),
                    value,
                    null
                ),
            }
        );
    }
}
