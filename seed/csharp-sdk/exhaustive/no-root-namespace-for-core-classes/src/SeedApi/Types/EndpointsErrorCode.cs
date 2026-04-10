using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(EndpointsErrorCode.EndpointsErrorCodeSerializer))]
[Serializable]
public readonly record struct EndpointsErrorCode : IStringEnum
{
    public static readonly EndpointsErrorCode InternalServerError = new(Values.InternalServerError);

    public static readonly EndpointsErrorCode Unauthorized = new(Values.Unauthorized);

    public static readonly EndpointsErrorCode Forbidden = new(Values.Forbidden);

    public static readonly EndpointsErrorCode BadRequest = new(Values.BadRequest);

    public static readonly EndpointsErrorCode Conflict = new(Values.Conflict);

    public static readonly EndpointsErrorCode Gone = new(Values.Gone);

    public static readonly EndpointsErrorCode UnprocessableEntity = new(Values.UnprocessableEntity);

    public static readonly EndpointsErrorCode NotImplemented = new(Values.NotImplemented);

    public static readonly EndpointsErrorCode BadGateway = new(Values.BadGateway);

    public static readonly EndpointsErrorCode ServiceUnavailable = new(Values.ServiceUnavailable);

    public static readonly EndpointsErrorCode Unknown = new(Values.Unknown);

    public EndpointsErrorCode(string value)
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
    public static EndpointsErrorCode FromCustom(string value)
    {
        return new EndpointsErrorCode(value);
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

    public static bool operator ==(EndpointsErrorCode value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(EndpointsErrorCode value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(EndpointsErrorCode value) => value.Value;

    public static explicit operator EndpointsErrorCode(string value) => new(value);

    internal class EndpointsErrorCodeSerializer : JsonConverter<EndpointsErrorCode>
    {
        public override EndpointsErrorCode Read(
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
            return new EndpointsErrorCode(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            EndpointsErrorCode value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override EndpointsErrorCode ReadAsPropertyName(
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
            return new EndpointsErrorCode(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            EndpointsErrorCode value,
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
        public const string InternalServerError = "INTERNAL_SERVER_ERROR";

        public const string Unauthorized = "UNAUTHORIZED";

        public const string Forbidden = "FORBIDDEN";

        public const string BadRequest = "BAD_REQUEST";

        public const string Conflict = "CONFLICT";

        public const string Gone = "GONE";

        public const string UnprocessableEntity = "UNPROCESSABLE_ENTITY";

        public const string NotImplemented = "NOT_IMPLEMENTED";

        public const string BadGateway = "BAD_GATEWAY";

        public const string ServiceUnavailable = "SERVICE_UNAVAILABLE";

        public const string Unknown = "Unknown";
    }
}
