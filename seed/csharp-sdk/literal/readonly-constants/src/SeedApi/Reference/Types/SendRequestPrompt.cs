using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(SendRequestPrompt.SendRequestPromptSerializer))]
[Serializable]
public readonly record struct SendRequestPrompt : IStringEnum
{
    public static readonly SendRequestPrompt YouAreAHelpfulAssistant = new(
        Values.YouAreAHelpfulAssistant
    );

    public SendRequestPrompt(string value)
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
    public static SendRequestPrompt FromCustom(string value)
    {
        return new SendRequestPrompt(value);
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

    public static bool operator ==(SendRequestPrompt value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(SendRequestPrompt value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(SendRequestPrompt value) => value.Value;

    public static explicit operator SendRequestPrompt(string value) => new(value);

    internal class SendRequestPromptSerializer : JsonConverter<SendRequestPrompt>
    {
        public override SendRequestPrompt Read(
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
            return new SendRequestPrompt(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            SendRequestPrompt value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override SendRequestPrompt ReadAsPropertyName(
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
            return new SendRequestPrompt(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            SendRequestPrompt value,
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
        public const string YouAreAHelpfulAssistant = "You are a helpful assistant";
    }
}
