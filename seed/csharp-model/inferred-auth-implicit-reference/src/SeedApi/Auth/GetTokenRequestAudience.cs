using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(GetTokenRequestAudience.GetTokenRequestAudienceSerializer))]
[Serializable]
public readonly record struct GetTokenRequestAudience : IStringEnum
{
    public static readonly GetTokenRequestAudience HttpsApiExampleCom = new(
        Values.HttpsApiExampleCom
    );

    public GetTokenRequestAudience(string value)
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
    public static GetTokenRequestAudience FromCustom(string value)
    {
        return new GetTokenRequestAudience(value);
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

    public static bool operator ==(GetTokenRequestAudience value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(GetTokenRequestAudience value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(GetTokenRequestAudience value) => value.Value;

    public static explicit operator GetTokenRequestAudience(string value) => new(value);

    internal class GetTokenRequestAudienceSerializer : JsonConverter<GetTokenRequestAudience>
    {
        public override GetTokenRequestAudience Read(
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
            return new GetTokenRequestAudience(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            GetTokenRequestAudience value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override GetTokenRequestAudience ReadAsPropertyName(
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
            return new GetTokenRequestAudience(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            GetTokenRequestAudience value,
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
        public const string HttpsApiExampleCom = "https://api.example.com";
    }
}
