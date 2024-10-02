using System;
using System.Text.Json.Serialization;
using SeedPagination.Core;

#nullable enable

namespace SeedPagination;

[JsonConverter(typeof(StringEnumSerializer<Order>))]
public readonly struct Order : IStringEnum, IEquatable<Order>
{
    public Order(string value)
    {
        Value = value;
    }

    /// <summary>
    /// The string value of the enum.
    /// </summary>
    public string Value { get; }

    public static readonly Order Asc = Custom(Values.Asc);

    public static readonly Order Desc = Custom(Values.Desc);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    public static class Values
    {
        public const string Asc = "asc";

        public const string Desc = "desc";
    }

    /// <summary>
    /// Create a string enum with the given value.
    /// </summary>
    public static Order Custom(string value)
    {
        return new Order(value);
    }

    /// <summary>
    /// Returns the string value of the enum.
    /// </summary>
    public override string ToString()
    {
        return Value;
    }

    public bool Equals(Order other)
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
        return Equals((Order)obj);
    }

    public override int GetHashCode()
    {
        return Value.GetHashCode();
    }

    public static bool operator ==(Order value1, Order value2) => value1.Equals(value2);

    public static bool operator !=(Order value1, Order value2) => !(value1 == value2);

    public static bool operator ==(Order value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(Order value1, string value2) => !value1.Value.Equals(value2);
}
