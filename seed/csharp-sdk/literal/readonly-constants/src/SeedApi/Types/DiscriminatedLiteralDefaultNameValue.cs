using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(
    typeof(DiscriminatedLiteralDefaultNameValue.DiscriminatedLiteralDefaultNameValueSerializer)
)]
[Serializable]
public readonly record struct DiscriminatedLiteralDefaultNameValue : IStringEnum
{
    public static readonly DiscriminatedLiteralDefaultNameValue Bob = new(Values.Bob);

    public DiscriminatedLiteralDefaultNameValue(string value)
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
    public static DiscriminatedLiteralDefaultNameValue FromCustom(string value)
    {
        return new DiscriminatedLiteralDefaultNameValue(value);
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

    public static bool operator ==(DiscriminatedLiteralDefaultNameValue value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(DiscriminatedLiteralDefaultNameValue value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(DiscriminatedLiteralDefaultNameValue value) =>
        value.Value;

    public static explicit operator DiscriminatedLiteralDefaultNameValue(string value) =>
        new(value);

    internal class DiscriminatedLiteralDefaultNameValueSerializer
        : JsonConverter<DiscriminatedLiteralDefaultNameValue>
    {
        public override DiscriminatedLiteralDefaultNameValue Read(
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
            return new DiscriminatedLiteralDefaultNameValue(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            DiscriminatedLiteralDefaultNameValue value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override DiscriminatedLiteralDefaultNameValue ReadAsPropertyName(
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
            return new DiscriminatedLiteralDefaultNameValue(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            DiscriminatedLiteralDefaultNameValue value,
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
        public const string Bob = "Bob";
    }
}
