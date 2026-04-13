using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(UnionWithSubTypesZeroType.UnionWithSubTypesZeroTypeSerializer))]
[Serializable]
public readonly record struct UnionWithSubTypesZeroType : IStringEnum
{
    public static readonly UnionWithSubTypesZeroType Foo = new(Values.Foo);

    public UnionWithSubTypesZeroType(string value)
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
    public static UnionWithSubTypesZeroType FromCustom(string value)
    {
        return new UnionWithSubTypesZeroType(value);
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

    public static bool operator ==(UnionWithSubTypesZeroType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(UnionWithSubTypesZeroType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(UnionWithSubTypesZeroType value) => value.Value;

    public static explicit operator UnionWithSubTypesZeroType(string value) => new(value);

    internal class UnionWithSubTypesZeroTypeSerializer : JsonConverter<UnionWithSubTypesZeroType>
    {
        public override UnionWithSubTypesZeroType Read(
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
            return new UnionWithSubTypesZeroType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithSubTypesZeroType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override UnionWithSubTypesZeroType ReadAsPropertyName(
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
            return new UnionWithSubTypesZeroType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnionWithSubTypesZeroType value,
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
