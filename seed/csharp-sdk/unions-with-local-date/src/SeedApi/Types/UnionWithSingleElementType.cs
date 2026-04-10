using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(UnionWithSingleElementType.UnionWithSingleElementTypeSerializer))]
[Serializable]
public readonly record struct UnionWithSingleElementType : IStringEnum
{
    public static readonly UnionWithSingleElementType Foo = new(Values.Foo);

    public UnionWithSingleElementType(string value)
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
    public static UnionWithSingleElementType FromCustom(string value)
    {
        return new UnionWithSingleElementType(value);
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

    public static bool operator ==(UnionWithSingleElementType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(UnionWithSingleElementType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(UnionWithSingleElementType value) => value.Value;

    public static explicit operator UnionWithSingleElementType(string value) => new(value);

    internal class UnionWithSingleElementTypeSerializer : JsonConverter<UnionWithSingleElementType>
    {
        public override UnionWithSingleElementType Read(
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
            return new UnionWithSingleElementType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithSingleElementType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override UnionWithSingleElementType ReadAsPropertyName(
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
            return new UnionWithSingleElementType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnionWithSingleElementType value,
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
