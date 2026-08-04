using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(LoadRequestCache.LoadRequestCacheSerializer))]
[Serializable]
public readonly record struct LoadRequestCache : IStringEnum
{
    public static readonly LoadRequestCache StaleIfSlow = new(Values.StaleIfSlow);

    public static readonly LoadRequestCache NoCache = new(Values.NoCache);

    public LoadRequestCache(string value)
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
    public static LoadRequestCache FromCustom(string value)
    {
        return new LoadRequestCache(value);
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

    public static bool operator ==(LoadRequestCache value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(LoadRequestCache value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(LoadRequestCache value) => value.Value;

    public static explicit operator LoadRequestCache(string value) => new(value);

    internal class LoadRequestCacheSerializer : JsonConverter<LoadRequestCache>
    {
        public override LoadRequestCache Read(
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
            return new LoadRequestCache(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            LoadRequestCache value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override LoadRequestCache ReadAsPropertyName(
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
            return new LoadRequestCache(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            LoadRequestCache value,
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
        public const string StaleIfSlow = "stale-if-slow";

        public const string NoCache = "no-cache";
    }
}
