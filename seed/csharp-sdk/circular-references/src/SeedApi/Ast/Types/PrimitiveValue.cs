using System;
using System.Text.Json.Serialization;
using SeedApi.Core;

#nullable enable

namespace SeedApi;

[JsonConverter(typeof(StringEnumSerializer<PrimitiveValue>))]
public readonly struct PrimitiveValue : IStringEnum, IEquatable<PrimitiveValue>
{
    public PrimitiveValue(string value)
    {
        Value = value;
    }

    /// <summary>
    /// The string value of the enum.
    /// </summary>
    public string Value { get; }

    public static readonly PrimitiveValue String = Custom(Values.String);

    public static readonly PrimitiveValue Number = Custom(Values.Number);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    public static class Values
    {
        public const string String = "STRING";

        public const string Number = "NUMBER";
    }

    /// <summary>
    /// Create a string enum with the given value.
    /// </summary>
    public static PrimitiveValue Custom(string value)
    {
        return new PrimitiveValue(value);
    }

    /// <summary>
    /// Returns the string value of the enum.
    /// </summary>
    public override string ToString()
    {
        return Value;
    }

    public bool Equals(PrimitiveValue other)
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
        return Equals((PrimitiveValue)obj);
    }

    public override int GetHashCode()
    {
        return Value.GetHashCode();
    }

    public static bool operator ==(PrimitiveValue value1, PrimitiveValue value2) =>
        value1.Equals(value2);

    public static bool operator !=(PrimitiveValue value1, PrimitiveValue value2) =>
        !(value1 == value2);

    public static bool operator ==(PrimitiveValue value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(PrimitiveValue value1, string value2) =>
        !value1.Value.Equals(value2);
}
