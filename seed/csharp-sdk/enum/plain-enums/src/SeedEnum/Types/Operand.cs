using global::System.Runtime.Serialization;
using global::System.Text.Json.Serialization;

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
    private static readonly global::System.Collections.Generic.Dictionary<
        string,
        Operand
    > _stringToEnum = new()
    {
        { ">", Operand.GreaterThan },
        { "=", Operand.EqualTo },
        { "less_than", Operand.LessThan },
    };

    private static readonly global::System.Collections.Generic.Dictionary<
        Operand,
        string
    > _enumToString = new()
    {
        { Operand.GreaterThan, ">" },
        { Operand.EqualTo, "=" },
        { Operand.LessThan, "less_than" },
    };

    public override Operand Read(
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
        Operand value,
        global::System.Text.Json.JsonSerializerOptions options
    )
    {
        writer.WriteStringValue(
            _enumToString.TryGetValue(value, out var stringValue) ? stringValue : null
        );
    }

    public override Operand ReadAsPropertyName(
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
        Operand value,
        global::System.Text.Json.JsonSerializerOptions options
    )
    {
        writer.WritePropertyName(
            _enumToString.TryGetValue(value, out var stringValue) ? stringValue : value.ToString()
        );
    }
}
