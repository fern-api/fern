using System.Text.Json.Serialization;
using SeedEnum.Core;

namespace SeedEnum;

[JsonConverter(typeof(StringEnumSerializer<ForwardCompatibleEnum>))]
[Serializable]
public readonly record struct ForwardCompatibleEnum : IStringEnum
{
    public static readonly ForwardCompatibleEnum Active = new(Values.Active);

    public static readonly ForwardCompatibleEnum Inactive = new(Values.Inactive);

    public ForwardCompatibleEnum(string value)
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
    public static ForwardCompatibleEnum FromCustom(string value)
    {
        return new ForwardCompatibleEnum(value);
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

    public static bool operator ==(ForwardCompatibleEnum value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(ForwardCompatibleEnum value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(ForwardCompatibleEnum value) => value.Value;

    public static explicit operator ForwardCompatibleEnum(string value) => new(value);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string Active = "active";

        public const string Inactive = "inactive";
    }
}
