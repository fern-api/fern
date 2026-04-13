using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(UnionWithDuplicateTypesOneType.UnionWithDuplicateTypesOneTypeSerializer))]
[Serializable]
public readonly record struct UnionWithDuplicateTypesOneType : IStringEnum
{
    public static readonly UnionWithDuplicateTypesOneType Foo2 = new(Values.Foo2);

    public UnionWithDuplicateTypesOneType(string value)
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
    public static UnionWithDuplicateTypesOneType FromCustom(string value)
    {
        return new UnionWithDuplicateTypesOneType(value);
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

    public static bool operator ==(UnionWithDuplicateTypesOneType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(UnionWithDuplicateTypesOneType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(UnionWithDuplicateTypesOneType value) => value.Value;

    public static explicit operator UnionWithDuplicateTypesOneType(string value) => new(value);

    internal class UnionWithDuplicateTypesOneTypeSerializer
        : JsonConverter<UnionWithDuplicateTypesOneType>
    {
        public override UnionWithDuplicateTypesOneType Read(
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
            return new UnionWithDuplicateTypesOneType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithDuplicateTypesOneType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override UnionWithDuplicateTypesOneType ReadAsPropertyName(
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
            return new UnionWithDuplicateTypesOneType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnionWithDuplicateTypesOneType value,
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
        public const string Foo2 = "foo2";
    }
}
