using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(QuerySendRequestOptionalPrompt.QuerySendRequestOptionalPromptSerializer))]
[Serializable]
public readonly record struct QuerySendRequestOptionalPrompt : IStringEnum
{
    public static readonly QuerySendRequestOptionalPrompt YouAreAHelpfulAssistant = new(
        Values.YouAreAHelpfulAssistant
    );

    public QuerySendRequestOptionalPrompt(string value)
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
    public static QuerySendRequestOptionalPrompt FromCustom(string value)
    {
        return new QuerySendRequestOptionalPrompt(value);
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

    public static bool operator ==(QuerySendRequestOptionalPrompt value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(QuerySendRequestOptionalPrompt value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(QuerySendRequestOptionalPrompt value) => value.Value;

    public static explicit operator QuerySendRequestOptionalPrompt(string value) => new(value);

    internal class QuerySendRequestOptionalPromptSerializer
        : JsonConverter<QuerySendRequestOptionalPrompt>
    {
        public override QuerySendRequestOptionalPrompt Read(
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
            return new QuerySendRequestOptionalPrompt(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            QuerySendRequestOptionalPrompt value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override QuerySendRequestOptionalPrompt ReadAsPropertyName(
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
            return new QuerySendRequestOptionalPrompt(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            QuerySendRequestOptionalPrompt value,
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
