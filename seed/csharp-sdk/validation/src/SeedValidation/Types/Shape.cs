using System;
using System.Text.Json.Serialization;
using SeedValidation.Core;

#nullable enable

namespace SeedValidation;

[JsonConverter(typeof(StringEnumSerializer<Shape>))]
public readonly struct Shape : IStringEnum, IEquatable<Shape>
{
    public Shape(string value)
    {
        Value = value;
    }

    /// <summary>
    /// The string value of the enum.
    /// </summary>
    public string Value { get; }

    public static readonly Shape Square = Custom(Values.Square);

    public static readonly Shape Circle = Custom(Values.Circle);

    public static readonly Shape Triangle = Custom(Values.Triangle);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    public static class Values
    {
        public const string Square = "SQUARE";

        public const string Circle = "CIRCLE";

        public const string Triangle = "TRIANGLE";
    }

    /// <summary>
    /// Create a string enum with the given value.
    /// </summary>
    public static Shape Custom(string value)
    {
        return new Shape(value);
    }

    /// <summary>
    /// Returns the string value of the enum.
    /// </summary>
    public override string ToString()
    {
        return Value;
    }

    public bool Equals(Shape other)
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
        return Equals((Shape)obj);
    }

    public override int GetHashCode()
    {
        return Value.GetHashCode();
    }

    public static bool operator ==(Shape value1, Shape value2) => value1.Equals(value2);

    public static bool operator !=(Shape value1, Shape value2) => !(value1 == value2);

    public static bool operator ==(Shape value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(Shape value1, string value2) => !value1.Value.Equals(value2);
}
