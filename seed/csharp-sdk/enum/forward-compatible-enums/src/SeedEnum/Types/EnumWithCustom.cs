using System.Text.Json.Serialization;
using SeedEnum.Core;

namespace SeedEnum;

[JsonConverter(typeof(StringEnumSerializer<EnumWithCustom>))]
[Serializable]
public readonly record struct EnumWithCustom : IStringEnum
{
    public static readonly EnumWithCustom Safe = new(Values.Safe);

    public static readonly EnumWithCustom Custom = new(Values.Custom);

    public EnumWithCustom(string value)
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
    public static EnumWithCustom FromCustom(string value)
    {
        return new EnumWithCustom(value);
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

    public static bool operator ==(EnumWithCustom value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(EnumWithCustom value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(EnumWithCustom value) => value.Value;

    public static explicit operator EnumWithCustom(string value) => new(value);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string Safe = "safe";

        public const string Custom = "Custom";
    }
}
