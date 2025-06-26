using System.Text.Json.Serialization;
using SeedUndiscriminatedUnions.Core;

namespace SeedUndiscriminatedUnions;

[JsonConverter(typeof(StringEnumSerializer<KeyType>))]
[Serializable]
public readonly record struct KeyType : IStringEnum
{
    public static readonly KeyType Name = new(Values.Name);

    public static readonly KeyType Value = new(Values.Value);

    public KeyType(string value)
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
    public static KeyType FromCustom(string value)
    {
        return new KeyType(value);
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

    public static bool operator ==(KeyType value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(KeyType value1, string value2) => !value1.Value.Equals(value2);

    public static explicit operator string(KeyType value) => value.Value;

    public static explicit operator KeyType(string value) => new(value);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string Name = "name";

        public const string Value = "value";
    }
}
