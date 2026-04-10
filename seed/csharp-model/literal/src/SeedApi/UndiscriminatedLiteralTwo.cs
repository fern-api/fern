using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(UndiscriminatedLiteralTwo.UndiscriminatedLiteralTwoSerializer))]
[Serializable]
public readonly record struct UndiscriminatedLiteralTwo : IStringEnum
{
    public static readonly UndiscriminatedLiteralTwo TenNonAlphanumericStringLiteralsYoureGoingToLoveWhyNumber8WillSurpriseYou =
        new(Values.TenNonAlphanumericStringLiteralsYoureGoingToLoveWhyNumber8WillSurpriseYou);

    public UndiscriminatedLiteralTwo(string value)
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
    public static UndiscriminatedLiteralTwo FromCustom(string value)
    {
        return new UndiscriminatedLiteralTwo(value);
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

    public static bool operator ==(UndiscriminatedLiteralTwo value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(UndiscriminatedLiteralTwo value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(UndiscriminatedLiteralTwo value) => value.Value;

    public static explicit operator UndiscriminatedLiteralTwo(string value) => new(value);

    internal class UndiscriminatedLiteralTwoSerializer : JsonConverter<UndiscriminatedLiteralTwo>
    {
        public override UndiscriminatedLiteralTwo Read(
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
            return new UndiscriminatedLiteralTwo(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UndiscriminatedLiteralTwo value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override UndiscriminatedLiteralTwo ReadAsPropertyName(
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
            return new UndiscriminatedLiteralTwo(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UndiscriminatedLiteralTwo value,
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
        public const string TenNonAlphanumericStringLiteralsYoureGoingToLoveWhyNumber8WillSurpriseYou =
            "10 non-alphanumeric string literals you're going to love & why (number 8 will surprise you)";
    }
}
