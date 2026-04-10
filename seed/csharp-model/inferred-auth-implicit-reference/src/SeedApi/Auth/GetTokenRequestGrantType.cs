using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(GetTokenRequestGrantType.GetTokenRequestGrantTypeSerializer))]
[Serializable]
public readonly record struct GetTokenRequestGrantType : IStringEnum
{
    public static readonly GetTokenRequestGrantType ClientCredentials = new(
        Values.ClientCredentials
    );

    public GetTokenRequestGrantType(string value)
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
    public static GetTokenRequestGrantType FromCustom(string value)
    {
        return new GetTokenRequestGrantType(value);
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

    public static bool operator ==(GetTokenRequestGrantType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(GetTokenRequestGrantType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(GetTokenRequestGrantType value) => value.Value;

    public static explicit operator GetTokenRequestGrantType(string value) => new(value);

    internal class GetTokenRequestGrantTypeSerializer : JsonConverter<GetTokenRequestGrantType>
    {
        public override GetTokenRequestGrantType Read(
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
            return new GetTokenRequestGrantType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            GetTokenRequestGrantType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override GetTokenRequestGrantType ReadAsPropertyName(
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
            return new GetTokenRequestGrantType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            GetTokenRequestGrantType value,
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
