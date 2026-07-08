using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(V1LoadRequestCache.V1LoadRequestCacheSerializer))]
[Serializable]
public readonly record struct V1LoadRequestCache : IStringEnum
{
    public static readonly V1LoadRequestCache StaleIfSlow = new(Values.StaleIfSlow);

    public static readonly V1LoadRequestCache NoCache = new(Values.NoCache);

    public V1LoadRequestCache(string value)
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
    public static V1LoadRequestCache FromCustom(string value)
    {
        return new V1LoadRequestCache(value);
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

    public static bool operator ==(V1LoadRequestCache value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(V1LoadRequestCache value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(V1LoadRequestCache value) => value.Value;

    public static explicit operator V1LoadRequestCache(string value) => new(value);

    internal class V1LoadRequestCacheSerializer : JsonConverter<V1LoadRequestCache>
    {
        public override V1LoadRequestCache Read(
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
            return new V1LoadRequestCache(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            V1LoadRequestCache value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override V1LoadRequestCache ReadAsPropertyName(
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
            return new V1LoadRequestCache(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            V1LoadRequestCache value,
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
