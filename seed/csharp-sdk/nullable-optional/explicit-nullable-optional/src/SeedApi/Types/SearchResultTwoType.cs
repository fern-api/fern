using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(SearchResultTwoType.SearchResultTwoTypeSerializer))]
[Serializable]
public readonly record struct SearchResultTwoType : IStringEnum
{
    public static readonly SearchResultTwoType Document = new(Values.Document);

    public SearchResultTwoType(string value)
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
    public static SearchResultTwoType FromCustom(string value)
    {
        return new SearchResultTwoType(value);
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

    public static bool operator ==(SearchResultTwoType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(SearchResultTwoType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(SearchResultTwoType value) => value.Value;

    public static explicit operator SearchResultTwoType(string value) => new(value);

    internal class SearchResultTwoTypeSerializer : JsonConverter<SearchResultTwoType>
    {
        public override SearchResultTwoType Read(
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
            return new SearchResultTwoType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            SearchResultTwoType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override SearchResultTwoType ReadAsPropertyName(
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
            return new SearchResultTwoType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            SearchResultTwoType value,
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
        public const string Document = "document";
    }
}
