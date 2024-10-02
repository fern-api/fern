using System;
using System.Text.Json.Serialization;
using SeedMixedCase.Core;

#nullable enable

namespace SeedMixedCase;

[JsonConverter(typeof(StringEnumSerializer<ResourceStatus>))]
public readonly struct ResourceStatus : IStringEnum, IEquatable<ResourceStatus>
{
    public ResourceStatus(string value)
    {
        Value = value;
    }

    /// <summary>
    /// The string value of the enum.
    /// </summary>
    public string Value { get; }

    public static readonly ResourceStatus Active = Custom(Values.Active);

    public static readonly ResourceStatus Inactive = Custom(Values.Inactive);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    public static class Values
    {
        public const string Active = "ACTIVE";

        public const string Inactive = "INACTIVE";
    }

    /// <summary>
    /// Create a string enum with the given value.
    /// </summary>
    public static ResourceStatus Custom(string value)
    {
        return new ResourceStatus(value);
    }

    /// <summary>
    /// Returns the string value of the enum.
    /// </summary>
    public override string ToString()
    {
        return Value;
    }

    public bool Equals(ResourceStatus other)
    {
        return Value == other.Value;
    }

    public bool Equals(string? other)
    {
        return Value.Equals(other);
    }

    public override bool Equals(object? obj)
    {
        if (obj is null)
            return false;
        if (obj is string stringObj)
            return Value.Equals(stringObj);
        if (obj.GetType() != GetType())
            return false;
        return Equals((ResourceStatus)obj);
    }

    public override int GetHashCode()
    {
        return Value.GetHashCode();
    }

    public static bool operator ==(ResourceStatus value1, ResourceStatus value2) =>
        value1.Equals(value2);

    public static bool operator !=(ResourceStatus value1, ResourceStatus value2) =>
        !(value1 == value2);

    public static bool operator ==(ResourceStatus value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(ResourceStatus value1, string value2) =>
        !value1.Value.Equals(value2);
}
