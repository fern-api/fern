using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(UndiscriminatedLiteralOne.UndiscriminatedLiteralOneSerializer))]
[Serializable]
public readonly record struct UndiscriminatedLiteralOne : IStringEnum
{
    public static readonly UndiscriminatedLiteralOne Ending = new(Values.Ending);

    public UndiscriminatedLiteralOne(string value)
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
    public static UndiscriminatedLiteralOne FromCustom(string value)
    {
        return new UndiscriminatedLiteralOne(value);
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

    public static bool operator ==(UndiscriminatedLiteralOne value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(UndiscriminatedLiteralOne value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(UndiscriminatedLiteralOne value) => value.Value;

    public static explicit operator UndiscriminatedLiteralOne(string value) => new(value);

    internal class UndiscriminatedLiteralOneSerializer : JsonConverter<UndiscriminatedLiteralOne>
    {
        public override UndiscriminatedLiteralOne Read(
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
            return new UndiscriminatedLiteralOne(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UndiscriminatedLiteralOne value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override UndiscriminatedLiteralOne ReadAsPropertyName(
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
            return new UndiscriminatedLiteralOne(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UndiscriminatedLiteralOne value,
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
        public const string Ending = "$ending";
    }
}
