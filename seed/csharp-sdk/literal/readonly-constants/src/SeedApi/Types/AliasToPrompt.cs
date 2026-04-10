using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(AliasToPrompt.AliasToPromptSerializer))]
[Serializable]
public readonly record struct AliasToPrompt : IStringEnum
{
    public static readonly AliasToPrompt YouAreAHelpfulAssistant = new(
        Values.YouAreAHelpfulAssistant
    );

    public AliasToPrompt(string value)
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
    public static AliasToPrompt FromCustom(string value)
    {
        return new AliasToPrompt(value);
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

    public static bool operator ==(AliasToPrompt value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(AliasToPrompt value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(AliasToPrompt value) => value.Value;

    public static explicit operator AliasToPrompt(string value) => new(value);

    internal class AliasToPromptSerializer : JsonConverter<AliasToPrompt>
    {
        public override AliasToPrompt Read(
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
            return new AliasToPrompt(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            AliasToPrompt value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override AliasToPrompt ReadAsPropertyName(
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
            return new AliasToPrompt(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            AliasToPrompt value,
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
