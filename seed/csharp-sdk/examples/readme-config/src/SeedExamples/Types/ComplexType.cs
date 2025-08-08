using System.Text.Json.Serialization;
using SeedExamples.Core;

namespace SeedExamples;

[JsonConverter(typeof(StringEnumSerializer<ComplexType>))]
[Serializable]
public readonly record struct ComplexType : IStringEnum
{
    public static readonly ComplexType Object = new(Values.Object);

    public static readonly ComplexType Union = new(Values.Union);

    public static readonly ComplexType Unknown = new(Values.Unknown);

    public ComplexType(string value)
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
    public static ComplexType FromCustom(string value)
    {
        return new ComplexType(value);
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

    public static bool operator ==(ComplexType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(ComplexType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(ComplexType value) => value.Value;

    public static explicit operator ComplexType(string value) => new(value);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string Object = "object";

        public const string Union = "union";

        public const string Unknown = "unknown";
    }
}
