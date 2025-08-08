using System.Text.Json.Serialization;

namespace SeedExamples;

[JsonConverter(typeof(SeedExamples.Core.StringEnumSerializer<SeedExamples.BasicType>))]
[Serializable]
public readonly record struct BasicType : SeedExamples.Core.IStringEnum
{
    public static readonly SeedExamples.BasicType Primitive = new(Values.Primitive);

    public static readonly SeedExamples.BasicType Literal = new(Values.Literal);

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
    public static SeedExamples.BasicType FromCustom(string value)
    {
        return new SeedExamples.BasicType(value);
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

    public static bool operator ==(SeedExamples.BasicType value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(SeedExamples.BasicType value1, string value2) => !value1.Value.Equals(value2);

    public static explicit operator string(SeedExamples.BasicType value) => value.Value;

    public static explicit operator SeedExamples.BasicType(string value) => new(value);

    namespace SeedExamples;

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
