using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(GetTokenAuthRequestAudience.GetTokenAuthRequestAudienceSerializer))]
[Serializable]
public readonly record struct GetTokenAuthRequestAudience : IStringEnum
{
    public static readonly GetTokenAuthRequestAudience Pets = new(Values.Pets);

    public GetTokenAuthRequestAudience(string value)
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
    public static GetTokenAuthRequestAudience FromCustom(string value)
    {
        return new GetTokenAuthRequestAudience(value);
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

    public static bool operator ==(GetTokenAuthRequestAudience value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(GetTokenAuthRequestAudience value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(GetTokenAuthRequestAudience value) => value.Value;

    public static explicit operator GetTokenAuthRequestAudience(string value) => new(value);

    internal class GetTokenAuthRequestAudienceSerializer
        : JsonConverter<GetTokenAuthRequestAudience>
    {
        public override GetTokenAuthRequestAudience Read(
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
            return new GetTokenAuthRequestAudience(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            GetTokenAuthRequestAudience value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override GetTokenAuthRequestAudience ReadAsPropertyName(
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
            return new GetTokenAuthRequestAudience(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            GetTokenAuthRequestAudience value,
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
        public const string Pets = "pets";
    }
}
