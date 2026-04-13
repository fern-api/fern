using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(AuthRefreshTokenRequestGrantType.AuthRefreshTokenRequestGrantTypeSerializer))]
[Serializable]
public readonly record struct AuthRefreshTokenRequestGrantType : IStringEnum
{
    public static readonly AuthRefreshTokenRequestGrantType RefreshToken = new(Values.RefreshToken);

    public AuthRefreshTokenRequestGrantType(string value)
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
    public static AuthRefreshTokenRequestGrantType FromCustom(string value)
    {
        return new AuthRefreshTokenRequestGrantType(value);
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

    public static bool operator ==(AuthRefreshTokenRequestGrantType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(AuthRefreshTokenRequestGrantType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(AuthRefreshTokenRequestGrantType value) => value.Value;

    public static explicit operator AuthRefreshTokenRequestGrantType(string value) => new(value);

    internal class AuthRefreshTokenRequestGrantTypeSerializer
        : JsonConverter<AuthRefreshTokenRequestGrantType>
    {
        public override AuthRefreshTokenRequestGrantType Read(
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
            return new AuthRefreshTokenRequestGrantType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            AuthRefreshTokenRequestGrantType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override AuthRefreshTokenRequestGrantType ReadAsPropertyName(
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
            return new AuthRefreshTokenRequestGrantType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            AuthRefreshTokenRequestGrantType value,
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
        public const string RefreshToken = "refresh_token";
    }
}
