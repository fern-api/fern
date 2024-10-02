using System;
using System.Text.Json.Serialization;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

[JsonConverter(typeof(StringEnumSerializer<ReservedKeywordEnum>))]
public readonly struct ReservedKeywordEnum : IStringEnum, IEquatable<ReservedKeywordEnum>
{
    public ReservedKeywordEnum(string value)
    {
        Value = value;
    }

    /// <summary>
    /// The string value of the enum.
    /// </summary>
    public string Value { get; }

    public static readonly ReservedKeywordEnum Is = Custom(Values.Is);

    public static readonly ReservedKeywordEnum As = Custom(Values.As);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    public static class Values
    {
        public const string Is = "is";

        public const string As = "as";
    }

    /// <summary>
    /// Create a string enum with the given value.
    /// </summary>
    public static ReservedKeywordEnum Custom(string value)
    {
        return new ReservedKeywordEnum(value);
    }

    /// <summary>
    /// Returns the string value of the enum.
    /// </summary>
    public override string ToString()
    {
        return Value;
    }

    public bool Equals(ReservedKeywordEnum other)
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
        return Equals((ReservedKeywordEnum)obj);
    }

    public override int GetHashCode()
    {
        return Value.GetHashCode();
    }

    public static bool operator ==(ReservedKeywordEnum value1, ReservedKeywordEnum value2) =>
        value1.Equals(value2);

    public static bool operator !=(ReservedKeywordEnum value1, ReservedKeywordEnum value2) =>
        !(value1 == value2);

    public static bool operator ==(ReservedKeywordEnum value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(ReservedKeywordEnum value1, string value2) =>
        !value1.Value.Equals(value2);
}
