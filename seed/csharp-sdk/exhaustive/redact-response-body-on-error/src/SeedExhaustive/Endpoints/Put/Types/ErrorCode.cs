using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints;

[JsonConverter(typeof(StringEnumSerializer<ErrorCode>))]
[Serializable]
public readonly record struct ErrorCode : IStringEnum
{
    public static readonly ErrorCode InternalServerError = new(Values.InternalServerError);

    public static readonly ErrorCode Unauthorized = new(Values.Unauthorized);

    public static readonly ErrorCode Forbidden = new(Values.Forbidden);

    public static readonly ErrorCode BadRequest = new(Values.BadRequest);

    public static readonly ErrorCode Conflict = new(Values.Conflict);

    public static readonly ErrorCode Gone = new(Values.Gone);

    public static readonly ErrorCode UnprocessableEntity = new(Values.UnprocessableEntity);

    public static readonly ErrorCode NotImplemented = new(Values.NotImplemented);

    public static readonly ErrorCode BadGateway = new(Values.BadGateway);

    public static readonly ErrorCode ServiceUnavailable = new(Values.ServiceUnavailable);

    public static readonly ErrorCode Unknown = new(Values.Unknown);

    public ErrorCode(string value)
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
    public static ErrorCode FromCustom(string value)
    {
        return new ErrorCode(value);
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

    public static bool operator ==(ErrorCode value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(ErrorCode value1, string value2) => !value1.Value.Equals(value2);

    public static explicit operator string(ErrorCode value) => value.Value;

    public static explicit operator ErrorCode(string value) => new(value);

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
