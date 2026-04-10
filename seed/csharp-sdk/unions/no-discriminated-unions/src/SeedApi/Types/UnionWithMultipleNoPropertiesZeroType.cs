using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(
    typeof(UnionWithMultipleNoPropertiesZeroType.UnionWithMultipleNoPropertiesZeroTypeSerializer)
)]
[Serializable]
public readonly record struct UnionWithMultipleNoPropertiesZeroType : IStringEnum
{
    public static readonly UnionWithMultipleNoPropertiesZeroType Foo = new(Values.Foo);

    public UnionWithMultipleNoPropertiesZeroType(string value)
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
    public static UnionWithMultipleNoPropertiesZeroType FromCustom(string value)
    {
        return new UnionWithMultipleNoPropertiesZeroType(value);
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

    public static bool operator ==(UnionWithMultipleNoPropertiesZeroType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(UnionWithMultipleNoPropertiesZeroType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(UnionWithMultipleNoPropertiesZeroType value) =>
        value.Value;

    public static explicit operator UnionWithMultipleNoPropertiesZeroType(string value) =>
        new(value);

    internal class UnionWithMultipleNoPropertiesZeroTypeSerializer
        : JsonConverter<UnionWithMultipleNoPropertiesZeroType>
    {
        public override UnionWithMultipleNoPropertiesZeroType Read(
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
            return new UnionWithMultipleNoPropertiesZeroType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithMultipleNoPropertiesZeroType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override UnionWithMultipleNoPropertiesZeroType ReadAsPropertyName(
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
            return new UnionWithMultipleNoPropertiesZeroType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnionWithMultipleNoPropertiesZeroType value,
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
