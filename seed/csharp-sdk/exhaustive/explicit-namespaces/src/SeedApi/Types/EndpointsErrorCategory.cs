using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(EndpointsErrorCategory.EndpointsErrorCategorySerializer))]
[Serializable]
public readonly record struct EndpointsErrorCategory : IStringEnum
{
    public static readonly EndpointsErrorCategory ApiError = new(Values.ApiError);

    public static readonly EndpointsErrorCategory AuthenticationError = new(
        Values.AuthenticationError
    );

    public static readonly EndpointsErrorCategory InvalidRequestError = new(
        Values.InvalidRequestError
    );

    public EndpointsErrorCategory(string value)
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
    public static EndpointsErrorCategory FromCustom(string value)
    {
        return new EndpointsErrorCategory(value);
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

    public static bool operator ==(EndpointsErrorCategory value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(EndpointsErrorCategory value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(EndpointsErrorCategory value) => value.Value;

    public static explicit operator EndpointsErrorCategory(string value) => new(value);

    internal class EndpointsErrorCategorySerializer : JsonConverter<EndpointsErrorCategory>
    {
        public override EndpointsErrorCategory Read(
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
            return new EndpointsErrorCategory(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            EndpointsErrorCategory value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override EndpointsErrorCategory ReadAsPropertyName(
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
            return new EndpointsErrorCategory(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            EndpointsErrorCategory value,
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
        public const string ApiError = "API_ERROR";

        public const string AuthenticationError = "AUTHENTICATION_ERROR";

        public const string InvalidRequestError = "INVALID_REQUEST_ERROR";
    }
}
