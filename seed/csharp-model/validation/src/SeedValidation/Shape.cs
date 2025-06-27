using System.Text.Json.Serialization;
using SeedValidation.Core;

namespace SeedValidation;

[JsonConverter(typeof(StringEnumSerializer<Shape>))]
[Serializable]
public readonly record struct Shape : IStringEnum
{
    public static readonly Shape Square = new(Values.Square);

    public static readonly Shape Circle = new(Values.Circle);

    public static readonly Shape Triangle = new(Values.Triangle);

    public Shape(string value)
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
    public static Shape FromCustom(string value)
    {
        return new Shape(value);
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

    public static bool operator ==(Shape value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(Shape value1, string value2) => !value1.Value.Equals(value2);

    public static explicit operator string(Shape value) => value.Value;

    public static explicit operator Shape(string value) => new(value);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string Square = "SQUARE";

        public const string Circle = "CIRCLE";

        public const string Triangle = "TRIANGLE";
    }
}
