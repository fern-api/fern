using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(UnionWithoutKeyZeroType.UnionWithoutKeyZeroTypeSerializer))]
[Serializable]
public readonly record struct UnionWithoutKeyZeroType : IStringEnum
{
    public static readonly UnionWithoutKeyZeroType Foo = new(Values.Foo);

    public UnionWithoutKeyZeroType(string value)
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
    public static UnionWithoutKeyZeroType FromCustom(string value)
    {
        return new UnionWithoutKeyZeroType(value);
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

    public static bool operator ==(UnionWithoutKeyZeroType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(UnionWithoutKeyZeroType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(UnionWithoutKeyZeroType value) => value.Value;

    public static explicit operator UnionWithoutKeyZeroType(string value) => new(value);

    internal class UnionWithoutKeyZeroTypeSerializer : JsonConverter<UnionWithoutKeyZeroType>
    {
        public override UnionWithoutKeyZeroType Read(
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
            return new UnionWithoutKeyZeroType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithoutKeyZeroType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override UnionWithoutKeyZeroType ReadAsPropertyName(
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
            return new UnionWithoutKeyZeroType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnionWithoutKeyZeroType value,
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
        public const string Foo = "foo";
    }
}
