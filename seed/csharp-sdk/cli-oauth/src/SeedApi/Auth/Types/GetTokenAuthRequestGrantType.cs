using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(GetTokenAuthRequestGrantType.GetTokenAuthRequestGrantTypeSerializer))]
[Serializable]
public readonly record struct GetTokenAuthRequestGrantType : IStringEnum
{
    public static readonly GetTokenAuthRequestGrantType ClientCredentials = new(
        Values.ClientCredentials
    );

    public GetTokenAuthRequestGrantType(string value)
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
    public static GetTokenAuthRequestGrantType FromCustom(string value)
    {
        return new GetTokenAuthRequestGrantType(value);
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

    public static bool operator ==(GetTokenAuthRequestGrantType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(GetTokenAuthRequestGrantType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(GetTokenAuthRequestGrantType value) => value.Value;

    public static explicit operator GetTokenAuthRequestGrantType(string value) => new(value);

    internal class GetTokenAuthRequestGrantTypeSerializer
        : JsonConverter<GetTokenAuthRequestGrantType>
    {
        public override GetTokenAuthRequestGrantType Read(
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
            return new GetTokenAuthRequestGrantType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            GetTokenAuthRequestGrantType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override GetTokenAuthRequestGrantType ReadAsPropertyName(
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
            return new GetTokenAuthRequestGrantType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            GetTokenAuthRequestGrantType value,
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
