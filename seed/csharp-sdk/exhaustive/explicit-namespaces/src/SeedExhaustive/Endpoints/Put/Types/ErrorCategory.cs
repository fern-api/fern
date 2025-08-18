using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints.Put;

[System.Text.Json.Serialization.JsonConverter(
    typeof(SeedExhaustive.Core.StringEnumSerializer<SeedExhaustive.Endpoints.Put.ErrorCategory>)
)]
[System.Serializable]
public readonly record struct ErrorCategory : SeedExhaustive.Core.IStringEnum
{
    public static readonly SeedExhaustive.Endpoints.Put.ErrorCategory ApiError = new(
        Values.ApiError
    );

    public static readonly SeedExhaustive.Endpoints.Put.ErrorCategory AuthenticationError = new(
        Values.AuthenticationError
    );

    public static readonly SeedExhaustive.Endpoints.Put.ErrorCategory InvalidRequestError = new(
        Values.InvalidRequestError
    );

    public ErrorCategory(string value)
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
    public static SeedExhaustive.Endpoints.Put.ErrorCategory FromCustom(string value)
    {
        return new SeedExhaustive.Endpoints.Put.ErrorCategory(value);
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

    public static bool operator ==(
        SeedExhaustive.Endpoints.Put.ErrorCategory value1,
        string value2
    ) => value1.Value.Equals(value2);

    public static bool operator !=(
        SeedExhaustive.Endpoints.Put.ErrorCategory value1,
        string value2
    ) => !value1.Value.Equals(value2);

    public static explicit operator string(SeedExhaustive.Endpoints.Put.ErrorCategory value) =>
        value.Value;

    public static explicit operator SeedExhaustive.Endpoints.Put.ErrorCategory(string value) =>
        new(value);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [System.Serializable]
    public static class Values
    {
        public const string ApiError = "API_ERROR";

        public const string AuthenticationError = "AUTHENTICATION_ERROR";

        public const string InvalidRequestError = "INVALID_REQUEST_ERROR";
    }
}
