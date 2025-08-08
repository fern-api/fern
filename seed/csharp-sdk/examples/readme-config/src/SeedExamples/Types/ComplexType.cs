using System.Text.Json.Serialization;

namespace SeedExamples;

[JsonConverter(typeof(SeedExamples.Core.StringEnumSerializer<SeedExamples.ComplexType>))]
[Serializable]
public readonly record struct ComplexType : SeedExamples.Core.IStringEnum
{
    public static readonly SeedExamples.ComplexType Object = new(Values.Object);

    public static readonly SeedExamples.ComplexType Union = new(Values.Union);

    public static readonly SeedExamples.ComplexType Unknown = new(Values.Unknown);

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
    public static SeedExamples.ComplexType FromCustom(string value)
    {
        return new SeedExamples.ComplexType(value);
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

    public static bool operator ==(SeedExamples.ComplexType value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(SeedExamples.ComplexType value1, string value2) => !value1.Value.Equals(value2);

    public static explicit operator string(SeedExamples.ComplexType value) => value.Value;

    public static explicit operator SeedExamples.ComplexType(string value) => new(value);

    namespace SeedExamples;

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
