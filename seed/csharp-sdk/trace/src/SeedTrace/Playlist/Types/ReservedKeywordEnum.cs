using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(StringEnumSerializer<ReservedKeywordEnum>))]
[Serializable]
public readonly record struct ReservedKeywordEnum : IStringEnum
{
    public static readonly ReservedKeywordEnum Is = new(Values.Is);

    public static readonly ReservedKeywordEnum As = new(Values.As);

    public ReservedKeywordEnum(string value)
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
    public static ReservedKeywordEnum FromCustom(string value)
    {
        return new ReservedKeywordEnum(value);
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

    public static bool operator ==(ReservedKeywordEnum value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(ReservedKeywordEnum value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(ReservedKeywordEnum value) => value.Value;

    public static explicit operator ReservedKeywordEnum(string value) => new(value);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string Is = "is";

        public const string As = "as";
    }
}
