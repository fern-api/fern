using System.Text.Json.Serialization;
using SeedEnum.Core;

namespace SeedEnum;

[JsonConverter(typeof(StringEnumSerializer<EnumWithSpecialCharacters>))]
[Serializable]
public readonly record struct EnumWithSpecialCharacters : IStringEnum
{
    public static readonly EnumWithSpecialCharacters Bla = new(Values.Bla);

    public static readonly EnumWithSpecialCharacters Yo = new(Values.Yo);

    public EnumWithSpecialCharacters(string value)
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
    public static EnumWithSpecialCharacters FromCustom(string value)
    {
        return new EnumWithSpecialCharacters(value);
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

    public static bool operator ==(EnumWithSpecialCharacters value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(EnumWithSpecialCharacters value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(EnumWithSpecialCharacters value) => value.Value;

    public static explicit operator EnumWithSpecialCharacters(string value) => new(value);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string Bla = "\\$bla";

        public const string Yo = "\\$yo";
    }
}
