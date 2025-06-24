using System.Text.Json.Serialization;
using SeedMixedCase.Core;

namespace SeedMixedCase;

[JsonConverter(typeof(StringEnumSerializer<ResourceStatus>))]
[Serializable]
public readonly record struct ResourceStatus : IStringEnum
{
    public static readonly ResourceStatus Active = new(Values.Active);

    public static readonly ResourceStatus Inactive = new(Values.Inactive);

    public ResourceStatus(string value)
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
    public static ResourceStatus FromCustom(string value)
    {
        return new ResourceStatus(value);
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

    public static bool operator ==(ResourceStatus value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(ResourceStatus value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(ResourceStatus value) => value.Value;

    public static explicit operator ResourceStatus(string value) => new(value);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string Active = "ACTIVE";

        public const string Inactive = "INACTIVE";
    }
}
