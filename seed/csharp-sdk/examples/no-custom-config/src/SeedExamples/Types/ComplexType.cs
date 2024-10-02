using System;
using System.Text.Json.Serialization;
using SeedExamples.Core;

#nullable enable

namespace SeedExamples;

[JsonConverter(typeof(StringEnumSerializer<ComplexType>))]
public readonly struct ComplexType : IStringEnum, IEquatable<ComplexType>
{
    public ComplexType(string value)
    {
        Value = value;
    }

    /// <summary>
    /// The string value of the enum.
    /// </summary>
    public string Value { get; }

    public static readonly ComplexType Object = Custom(Values.Object);

    public static readonly ComplexType Union = Custom(Values.Union);

    public static readonly ComplexType Unknown = Custom(Values.Unknown);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    public static class Values
    {
        public const string Object = "object";

        public const string Union = "union";

        public const string Unknown = "unknown";
    }

    /// <summary>
    /// Create a string enum with the given value.
    /// </summary>
    public static ComplexType Custom(string value)
    {
        return new ComplexType(value);
    }

    /// <summary>
    /// Returns the string value of the enum.
    /// </summary>
    public override string ToString()
    {
        return Value;
    }

    public bool Equals(ComplexType other)
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
        return Equals((ComplexType)obj);
    }

    public override int GetHashCode()
    {
        return Value.GetHashCode();
    }

    public static bool operator ==(ComplexType value1, ComplexType value2) => value1.Equals(value2);

    public static bool operator !=(ComplexType value1, ComplexType value2) => !(value1 == value2);

    public static bool operator ==(ComplexType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(ComplexType value1, string value2) =>
        !value1.Value.Equals(value2);
}
