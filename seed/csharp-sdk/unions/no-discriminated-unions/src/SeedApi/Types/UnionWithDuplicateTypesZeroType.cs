using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(UnionWithDuplicateTypesZeroType.UnionWithDuplicateTypesZeroTypeSerializer))]
[Serializable]
public readonly record struct UnionWithDuplicateTypesZeroType : IStringEnum
{
    public static readonly UnionWithDuplicateTypesZeroType Foo1 = new(Values.Foo1);

    public UnionWithDuplicateTypesZeroType(string value)
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
    public static UnionWithDuplicateTypesZeroType FromCustom(string value)
    {
        return new UnionWithDuplicateTypesZeroType(value);
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

    public static bool operator ==(UnionWithDuplicateTypesZeroType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(UnionWithDuplicateTypesZeroType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(UnionWithDuplicateTypesZeroType value) => value.Value;

    public static explicit operator UnionWithDuplicateTypesZeroType(string value) => new(value);

    internal class UnionWithDuplicateTypesZeroTypeSerializer
        : JsonConverter<UnionWithDuplicateTypesZeroType>
    {
        public override UnionWithDuplicateTypesZeroType Read(
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
            return new UnionWithDuplicateTypesZeroType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithDuplicateTypesZeroType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override UnionWithDuplicateTypesZeroType ReadAsPropertyName(
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
            return new UnionWithDuplicateTypesZeroType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnionWithDuplicateTypesZeroType value,
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
        public const string Foo1 = "foo1";
    }
}
