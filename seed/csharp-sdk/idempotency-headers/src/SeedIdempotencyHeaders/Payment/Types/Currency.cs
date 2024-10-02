using System;
using System.Text.Json.Serialization;
using SeedIdempotencyHeaders.Core;

#nullable enable

namespace SeedIdempotencyHeaders;

[JsonConverter(typeof(StringEnumSerializer<Currency>))]
public readonly struct Currency : IStringEnum, IEquatable<Currency>
{
    public Currency(string value)
    {
        Value = value;
    }

    /// <summary>
    /// The string value of the enum.
    /// </summary>
    public string Value { get; }

    public static readonly Currency Usd = Custom(Values.Usd);

    public static readonly Currency Yen = Custom(Values.Yen);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    public static class Values
    {
        public const string Usd = "USD";

        public const string Yen = "YEN";
    }

    /// <summary>
    /// Create a string enum with the given value.
    /// </summary>
    public static Currency Custom(string value)
    {
        return new Currency(value);
    }

    /// <summary>
    /// Returns the string value of the enum.
    /// </summary>
    public override string ToString()
    {
        return Value;
    }

    public bool Equals(Currency other)
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
        return Equals((Currency)obj);
    }

    public override int GetHashCode()
    {
        return Value.GetHashCode();
    }

    public static bool operator ==(Currency value1, Currency value2) => value1.Equals(value2);

    public static bool operator !=(Currency value1, Currency value2) => !(value1 == value2);

    public static bool operator ==(Currency value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(Currency value1, string value2) => !value1.Value.Equals(value2);
}
