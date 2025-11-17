using System.Text.Json.Serialization;
using SeedAnyAuth.Core;

namespace SeedAnyAuth;

[JsonConverter(typeof(StringEnumSerializer<GrantType>))]
[Serializable]
public readonly record struct GrantType : IStringEnum
{
    public static readonly GrantType AuthorizationCode = new(Values.AuthorizationCode);

    public static readonly GrantType RefreshToken = new(Values.RefreshToken);

    public static readonly GrantType ClientCredentials = new(Values.ClientCredentials);

    public GrantType(string value)
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
    public static GrantType FromCustom(string value)
    {
        return new GrantType(value);
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

    public static bool operator ==(GrantType value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(GrantType value1, string value2) => !value1.Value.Equals(value2);

    public static explicit operator string(GrantType value) => value.Value;

    public static explicit operator GrantType(string value) => new(value);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string AuthorizationCode = "authorization_code";

        public const string RefreshToken = "refresh_token";

        public const string ClientCredentials = "client_credentials";
    }
}
