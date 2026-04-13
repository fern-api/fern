using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(SearchResultZeroType.SearchResultZeroTypeSerializer))]
[Serializable]
public readonly record struct SearchResultZeroType : IStringEnum
{
    public static readonly SearchResultZeroType User = new(Values.User);

    public SearchResultZeroType(string value)
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
    public static SearchResultZeroType FromCustom(string value)
    {
        return new SearchResultZeroType(value);
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

    public static bool operator ==(SearchResultZeroType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(SearchResultZeroType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(SearchResultZeroType value) => value.Value;

    public static explicit operator SearchResultZeroType(string value) => new(value);

    internal class SearchResultZeroTypeSerializer : JsonConverter<SearchResultZeroType>
    {
        public override SearchResultZeroType Read(
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
            return new SearchResultZeroType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            SearchResultZeroType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override SearchResultZeroType ReadAsPropertyName(
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
            return new SearchResultZeroType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            SearchResultZeroType value,
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
        public const string User = "user";
    }
}
