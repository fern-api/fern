using System;
using System.Text.Json.Serialization;
using SeedUndiscriminatedUnions.Core;

#nullable enable

namespace SeedUndiscriminatedUnions;

[JsonConverter(typeof(StringEnumSerializer<KeyType>))]
public readonly struct KeyType : IStringEnum, IEquatable<KeyType>
{
    public KeyType(string value)
    {
        Value = value;
    }

    /// <summary>
    /// The string value of the enum.
    /// </summary>
    public string Value { get; }

    public static readonly KeyType Name = Custom(Values.Name);

    public static readonly KeyType Value = Custom(Values.Value);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    public static class Values
    {
        public const string Name = "name";

        public const string Value = "value";
    }

    /// <summary>
    /// Create a string enum with the given value.
    /// </summary>
    public static KeyType Custom(string value)
    {
        return new KeyType(value);
    }

    /// <summary>
    /// Returns the string value of the enum.
    /// </summary>
    public override string ToString()
    {
        return Value;
    }

    public bool Equals(KeyType other)
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
        return Equals((KeyType)obj);
    }

    public override int GetHashCode()
    {
        return Value.GetHashCode();
    }

    public static bool operator ==(KeyType value1, KeyType value2) => value1.Equals(value2);

    public static bool operator !=(KeyType value1, KeyType value2) => !(value1 == value2);

    public static bool operator ==(KeyType value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(KeyType value1, string value2) => !value1.Value.Equals(value2);
}
