using System;
using System.Text.Json.Serialization;
using SeedEnum.Core;

#nullable enable

namespace SeedEnum;

[JsonConverter(typeof(StringEnumSerializer<Operand>))]
public readonly struct Operand : IStringEnum, IEquatable<Operand>
{
    public Operand(string value)
    {
        Value = value;
    }

    /// <summary>
    /// The string value of the enum.
    /// </summary>
    public string Value { get; }

    public static readonly Operand GreaterThan = Custom(Values.GreaterThan);

    public static readonly Operand EqualTo = Custom(Values.EqualTo);

    /// <summary>
    /// The name and value should be similar
    /// are similar for less than.
    /// </summary>
    public static readonly Operand LessThan = Custom(Values.LessThan);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    public static class Values
    {
        public const string GreaterThan = ">";

        public const string EqualTo = "=";

        /// <summary>
        /// The name and value should be similar
        /// are similar for less than.
        /// </summary>
        public const string LessThan = "less_than";
    }

    /// <summary>
    /// Create a string enum with the given value.
    /// </summary>
    public static Operand Custom(string value)
    {
        return new Operand(value);
    }

    /// <summary>
    /// Returns the string value of the enum.
    /// </summary>
    public override string ToString()
    {
        return Value;
    }

    public bool Equals(Operand other)
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
        return Equals((Operand)obj);
    }

    public override int GetHashCode()
    {
        return Value.GetHashCode();
    }

    public static bool operator ==(Operand value1, Operand value2) => value1.Equals(value2);

    public static bool operator !=(Operand value1, Operand value2) => !(value1 == value2);

    public static bool operator ==(Operand value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(Operand value1, string value2) => !value1.Value.Equals(value2);
}
