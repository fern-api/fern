using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(UnionWithNoPropertiesZeroType.UnionWithNoPropertiesZeroTypeSerializer))]
[Serializable]
public readonly record struct UnionWithNoPropertiesZeroType : IStringEnum
{
    public static readonly UnionWithNoPropertiesZeroType Foo = new(Values.Foo);

    public UnionWithNoPropertiesZeroType(string value)
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
    public static UnionWithNoPropertiesZeroType FromCustom(string value)
    {
        return new UnionWithNoPropertiesZeroType(value);
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

    public static bool operator ==(UnionWithNoPropertiesZeroType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(UnionWithNoPropertiesZeroType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(UnionWithNoPropertiesZeroType value) => value.Value;

    public static explicit operator UnionWithNoPropertiesZeroType(string value) => new(value);

    internal class UnionWithNoPropertiesZeroTypeSerializer
        : JsonConverter<UnionWithNoPropertiesZeroType>
    {
        public override UnionWithNoPropertiesZeroType Read(
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
            return new UnionWithNoPropertiesZeroType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithNoPropertiesZeroType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override UnionWithNoPropertiesZeroType ReadAsPropertyName(
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
            return new UnionWithNoPropertiesZeroType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnionWithNoPropertiesZeroType value,
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
