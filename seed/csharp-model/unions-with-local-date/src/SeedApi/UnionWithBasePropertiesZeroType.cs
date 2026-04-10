using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(UnionWithBasePropertiesZeroType.UnionWithBasePropertiesZeroTypeSerializer))]
[Serializable]
public readonly record struct UnionWithBasePropertiesZeroType : IStringEnum
{
    public static readonly UnionWithBasePropertiesZeroType Integer = new(Values.Integer);

    public UnionWithBasePropertiesZeroType(string value)
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
    public static UnionWithBasePropertiesZeroType FromCustom(string value)
    {
        return new UnionWithBasePropertiesZeroType(value);
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

    public static bool operator ==(UnionWithBasePropertiesZeroType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(UnionWithBasePropertiesZeroType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(UnionWithBasePropertiesZeroType value) => value.Value;

    public static explicit operator UnionWithBasePropertiesZeroType(string value) => new(value);

    internal class UnionWithBasePropertiesZeroTypeSerializer
        : JsonConverter<UnionWithBasePropertiesZeroType>
    {
        public override UnionWithBasePropertiesZeroType Read(
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
            return new UnionWithBasePropertiesZeroType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithBasePropertiesZeroType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override UnionWithBasePropertiesZeroType ReadAsPropertyName(
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
            return new UnionWithBasePropertiesZeroType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnionWithBasePropertiesZeroType value,
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
        public const string Integer = "integer";
    }
}
