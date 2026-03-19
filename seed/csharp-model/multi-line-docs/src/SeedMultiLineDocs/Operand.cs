using System.Text.Json;
using System.Text.Json.Serialization;
using SeedMultiLineDocs.Core;

namespace SeedMultiLineDocs;

[JsonConverter(typeof(Operand.OperandSerializer))]
[Serializable]
public readonly record struct Operand : IStringEnum
{
    public static readonly Operand GreaterThan = new(Values.GreaterThan);

    public static readonly Operand EqualTo = new(Values.EqualTo);

    /// <summary>
    /// The name and value should be similar
    /// are similar for less than.
    /// </summary>
    public static readonly Operand LessThan = new(Values.LessThan);

    public Operand(string value)
    {
        Value = value;
    }

    /// <summary>
    /// The string value of the enum.
    /// </summary>
    public string Value { get; }

    /// <summary>
    /// Create a string enum with the given value.
    /// </summary>
    public static Operand FromCustom(string value)
    {
        return new Operand(value);
    }

    public bool Equals(string? other)
    {
        return Value.Equals(other);
    }

    /// <summary>
    /// Returns the string value of the enum.
    /// </summary>
    public override string ToString()
    {
        return Value;
    }

    public static bool operator ==(Operand value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(Operand value1, string value2) => !value1.Value.Equals(value2);

    public static explicit operator string(Operand value) => value.Value;

    public static explicit operator Operand(string value) => new(value);

    internal class OperandSerializer : JsonConverter<Operand>
    {
        public override Operand Read(
            ref Utf8JsonReader reader,
            Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new global::System.Exception(
                    "The JSON value could not be read as a string."
                );
            return new Operand(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            Operand value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override Operand ReadAsPropertyName(
            ref Utf8JsonReader reader,
            Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new global::System.Exception(
                    "The JSON property name could not be read as a string."
                );
            return new Operand(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Operand value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Value);
        }
    }

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string GreaterThan = ">";

        public const string EqualTo = "=";

        /// <summary>
        /// The name and value should be similar
        /// are similar for less than.
        /// </summary>
        public const string LessThan = "less_than";
    }
}
