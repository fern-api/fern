using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(QuerySendRequestPrompt.QuerySendRequestPromptSerializer))]
[Serializable]
public readonly record struct QuerySendRequestPrompt : IStringEnum
{
    public static readonly QuerySendRequestPrompt YouAreAHelpfulAssistant = new(
        Values.YouAreAHelpfulAssistant
    );

    public QuerySendRequestPrompt(string value)
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
    public static QuerySendRequestPrompt FromCustom(string value)
    {
        return new QuerySendRequestPrompt(value);
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

    public static bool operator ==(QuerySendRequestPrompt value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(QuerySendRequestPrompt value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(QuerySendRequestPrompt value) => value.Value;

    public static explicit operator QuerySendRequestPrompt(string value) => new(value);

    internal class QuerySendRequestPromptSerializer : JsonConverter<QuerySendRequestPrompt>
    {
        public override QuerySendRequestPrompt Read(
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
            return new QuerySendRequestPrompt(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            QuerySendRequestPrompt value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override QuerySendRequestPrompt ReadAsPropertyName(
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
            return new QuerySendRequestPrompt(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            QuerySendRequestPrompt value,
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
