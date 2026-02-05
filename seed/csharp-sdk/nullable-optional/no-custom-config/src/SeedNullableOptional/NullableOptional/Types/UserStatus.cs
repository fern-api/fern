using System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

[JsonConverter(typeof(StringEnumSerializer<UserStatus>))]
[Serializable]
public readonly record struct UserStatus : IStringEnum
{
    public static readonly UserStatus Active = new(Values.Active);

    public static readonly UserStatus Inactive = new(Values.Inactive);

    public static readonly UserStatus Suspended = new(Values.Suspended);

    public static readonly UserStatus Deleted = new(Values.Deleted);

    public UserStatus(string value)
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
    public static UserStatus FromCustom(string value)
    {
        return new UserStatus(value);
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

    public static bool operator ==(UserStatus value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(UserStatus value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(UserStatus value) => value.Value;

    public static explicit operator UserStatus(string value) => new(value);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string Active = "active";

        public const string Inactive = "inactive";

        public const string Suspended = "suspended";

        public const string Deleted = "deleted";
    }
}
