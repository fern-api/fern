using System;
using System.Text.Json.Serialization;
using SeedExamples.Core;

#nullable enable

namespace SeedExamples;

[JsonConverter(typeof(StringEnumSerializer<BasicType>))]
public readonly struct BasicType : IStringEnum, IEquatable<BasicType>
{
    public BasicType(string value)
    {
        Value = value;
    }

    /// <summary>
    /// The string value of the enum.
    /// </summary>
    public string Value { get; }

    public static readonly BasicType Primitive = Custom(Values.Primitive);

    public static readonly BasicType Literal = Custom(Values.Literal);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    public static class Values
    {
        public const string Primitive = "primitive";

        public const string Literal = "literal";
    }

    /// <summary>
    /// Create a string enum with the given value.
    /// </summary>
    public static BasicType Custom(string value)
    {
        return new BasicType(value);
    }

    /// <summary>
    /// Returns the string value of the enum.
    /// </summary>
    public override string ToString()
    {
        return Value;
    }

    public bool Equals(BasicType other)
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
        return Equals((BasicType)obj);
    }

    public override int GetHashCode()
    {
        return Value.GetHashCode();
    }

    public static bool operator ==(BasicType value1, BasicType value2) => value1.Equals(value2);

    public static bool operator !=(BasicType value1, BasicType value2) => !(value1 == value2);

    public static bool operator ==(BasicType value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(BasicType value1, string value2) => !value1.Value.Equals(value2);
}
