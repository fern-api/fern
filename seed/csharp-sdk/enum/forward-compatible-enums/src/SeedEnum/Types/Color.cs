using System.Text.Json.Serialization;
using SeedEnum.Core;

namespace SeedEnum;

[JsonConverter(typeof(StringEnumSerializer<Color>))]
public readonly record struct Color : IStringEnum
{
    public Color(string value)
    {
        Value = value;
    }

    /// <summary>
    /// The string value of the enum.
    /// </summary>
    public string Value { get; }

    public static readonly Color Red = Custom(Values.Red);

    public static readonly Color Blue = Custom(Values.Blue);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    public static class Values
    {
        public const string Red = "red";

        public const string Blue = "blue";
    }

    /// <summary>
    /// Create a string enum with the given value.
    /// </summary>
    public static Color Custom(string value)
    {
        return new Color(value);
    }

    /// <summary>
    /// Returns the string value of the enum.
    /// </summary>
    public override string ToString()
    {
        return Value;
    }

    public bool Equals(string? other)
    {
        return Value.Equals(other);
    }

    public static bool operator ==(Color value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(Color value1, string value2) => !value1.Value.Equals(value2);
}
