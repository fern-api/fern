using System.Text.Json.Serialization;
using SeedExamples.Core;

namespace SeedExamples;

[JsonConverter(typeof(StringEnumSerializer<BasicType>))]
[Serializable]
public readonly record struct BasicType : IStringEnum
{
    public static readonly BasicType Primitive = new(Values.Primitive);

    public static readonly BasicType Literal = new(Values.Literal);

    public BasicType(string value)
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
    public static BasicType FromCustom(string value)
    {
        return new BasicType(value);
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

    public static bool operator ==(BasicType value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(BasicType value1, string value2) => !value1.Value.Equals(value2);

    public static explicit operator string(BasicType value) => value.Value;

    public static explicit operator BasicType(string value) => new(value);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string Primitive = "primitive";

        public const string Literal = "literal";
    }
}
