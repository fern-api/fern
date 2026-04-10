using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(SomeAliasedLiteral.SomeAliasedLiteralSerializer))]
[Serializable]
public readonly record struct SomeAliasedLiteral : IStringEnum
{
    public static readonly SomeAliasedLiteral YoureSuperWise = new(Values.YoureSuperWise);

    public SomeAliasedLiteral(string value)
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
    public static SomeAliasedLiteral FromCustom(string value)
    {
        return new SomeAliasedLiteral(value);
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

    public static bool operator ==(SomeAliasedLiteral value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(SomeAliasedLiteral value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(SomeAliasedLiteral value) => value.Value;

    public static explicit operator SomeAliasedLiteral(string value) => new(value);

    internal class SomeAliasedLiteralSerializer : JsonConverter<SomeAliasedLiteral>
    {
        public override SomeAliasedLiteral Read(
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
            return new SomeAliasedLiteral(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            SomeAliasedLiteral value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override SomeAliasedLiteral ReadAsPropertyName(
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
            return new SomeAliasedLiteral(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            SomeAliasedLiteral value,
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
        public const string YoureSuperWise = "You're super wise";
    }
}
