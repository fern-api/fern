using System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

[JsonConverter(typeof(StringEnumSerializer<UserRole>))]
[Serializable]
public readonly record struct UserRole : IStringEnum
{
    public static readonly UserRole Admin = new(Values.Admin);

    public static readonly UserRole User = new(Values.User);

    public static readonly UserRole Guest = new(Values.Guest);

    public static readonly UserRole Moderator = new(Values.Moderator);

    public UserRole(string value)
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
    public static UserRole FromCustom(string value)
    {
        return new UserRole(value);
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

    public static bool operator ==(UserRole value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(UserRole value1, string value2) => !value1.Value.Equals(value2);

    public static explicit operator string(UserRole value) => value.Value;

    public static explicit operator UserRole(string value) => new(value);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string Admin = "ADMIN";

        public const string User = "USER";

        public const string Guest = "GUEST";

        public const string Moderator = "MODERATOR";
    }
}
