using System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(StringEnumSerializer<PrimitiveValue>))]
[Serializable]
public readonly record struct PrimitiveValue : IStringEnum
{
    public static readonly PrimitiveValue String = new(Values.String);

    public static readonly PrimitiveValue Number = new(Values.Number);

    public PrimitiveValue(string value)
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
    public static PrimitiveValue FromCustom(string value)
    {
        return new PrimitiveValue(value);
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

    public static bool operator ==(PrimitiveValue value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(PrimitiveValue value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(PrimitiveValue value) => value.Value;

    public static explicit operator PrimitiveValue(string value) => new(value);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string String = "STRING";

        public const string Number = "NUMBER";
    }
}
