using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(AuthGetTokenRequestGrantType.AuthGetTokenRequestGrantTypeSerializer))]
[Serializable]
public readonly record struct AuthGetTokenRequestGrantType : IStringEnum
{
    public static readonly AuthGetTokenRequestGrantType ClientCredentials = new(
        Values.ClientCredentials
    );

    public AuthGetTokenRequestGrantType(string value)
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
    public static AuthGetTokenRequestGrantType FromCustom(string value)
    {
        return new AuthGetTokenRequestGrantType(value);
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

    public static bool operator ==(AuthGetTokenRequestGrantType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(AuthGetTokenRequestGrantType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(AuthGetTokenRequestGrantType value) => value.Value;

    public static explicit operator AuthGetTokenRequestGrantType(string value) => new(value);

    internal class AuthGetTokenRequestGrantTypeSerializer
        : JsonConverter<AuthGetTokenRequestGrantType>
    {
        public override AuthGetTokenRequestGrantType Read(
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
            return new AuthGetTokenRequestGrantType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            AuthGetTokenRequestGrantType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override AuthGetTokenRequestGrantType ReadAsPropertyName(
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
            return new AuthGetTokenRequestGrantType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            AuthGetTokenRequestGrantType value,
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
        public const string ClientCredentials = "client_credentials";
    }
}
