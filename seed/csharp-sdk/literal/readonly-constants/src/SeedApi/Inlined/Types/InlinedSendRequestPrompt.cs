using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(InlinedSendRequestPrompt.InlinedSendRequestPromptSerializer))]
[Serializable]
public readonly record struct InlinedSendRequestPrompt : IStringEnum
{
    public static readonly InlinedSendRequestPrompt YouAreAHelpfulAssistant = new(
        Values.YouAreAHelpfulAssistant
    );

    public InlinedSendRequestPrompt(string value)
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
    public static InlinedSendRequestPrompt FromCustom(string value)
    {
        return new InlinedSendRequestPrompt(value);
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

    public static bool operator ==(InlinedSendRequestPrompt value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(InlinedSendRequestPrompt value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(InlinedSendRequestPrompt value) => value.Value;

    public static explicit operator InlinedSendRequestPrompt(string value) => new(value);

    internal class InlinedSendRequestPromptSerializer : JsonConverter<InlinedSendRequestPrompt>
    {
        public override InlinedSendRequestPrompt Read(
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
            return new InlinedSendRequestPrompt(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            InlinedSendRequestPrompt value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override InlinedSendRequestPrompt ReadAsPropertyName(
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
            return new InlinedSendRequestPrompt(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            InlinedSendRequestPrompt value,
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
