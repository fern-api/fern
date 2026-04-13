using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(AuthRefreshTokenRequestAudience.AuthRefreshTokenRequestAudienceSerializer))]
[Serializable]
public readonly record struct AuthRefreshTokenRequestAudience : IStringEnum
{
    public static readonly AuthRefreshTokenRequestAudience HttpsApiExampleCom = new(
        Values.HttpsApiExampleCom
    );

    public AuthRefreshTokenRequestAudience(string value)
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
    public static AuthRefreshTokenRequestAudience FromCustom(string value)
    {
        return new AuthRefreshTokenRequestAudience(value);
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

    public static bool operator ==(AuthRefreshTokenRequestAudience value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(AuthRefreshTokenRequestAudience value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(AuthRefreshTokenRequestAudience value) => value.Value;

    public static explicit operator AuthRefreshTokenRequestAudience(string value) => new(value);

    internal class AuthRefreshTokenRequestAudienceSerializer
        : JsonConverter<AuthRefreshTokenRequestAudience>
    {
        public override AuthRefreshTokenRequestAudience Read(
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
            return new AuthRefreshTokenRequestAudience(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            AuthRefreshTokenRequestAudience value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override AuthRefreshTokenRequestAudience ReadAsPropertyName(
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
            return new AuthRefreshTokenRequestAudience(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            AuthRefreshTokenRequestAudience value,
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
