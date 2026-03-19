using System.Text.Json;
using System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(PrimitiveValue.PrimitiveValueSerializer))]
[Serializable]
public readonly record struct PrimitiveValue : IStringEnum
{
    public static readonly PrimitiveValue String = new(Values.String);

    public static readonly PrimitiveValue Number = new(Values.Number);

    public PrimitiveValue(string value)
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
    public static PrimitiveValue FromCustom(string value)
    {
        return new PrimitiveValue(value);
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

    public static bool operator ==(PrimitiveValue value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(PrimitiveValue value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(PrimitiveValue value) => value.Value;

    public static explicit operator PrimitiveValue(string value) => new(value);

    internal class PrimitiveValueSerializer : JsonConverter<PrimitiveValue>
    {
        public override PrimitiveValue Read(
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
            return new PrimitiveValue(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            PrimitiveValue value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override PrimitiveValue ReadAsPropertyName(
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
            return new PrimitiveValue(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            PrimitiveValue value,
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
        public const string String = "STRING";

        public const string Number = "NUMBER";
    }
}
