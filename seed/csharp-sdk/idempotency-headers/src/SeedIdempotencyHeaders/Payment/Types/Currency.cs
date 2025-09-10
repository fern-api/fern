using System.Text.Json.Serialization;
using SeedIdempotencyHeaders.Core;

namespace SeedIdempotencyHeaders;

[JsonConverter(typeof(StringEnumSerializer<Currency>))]
[Serializable]
public readonly record struct Currency : IStringEnum
{
    public static readonly Currency Usd = new(Values.Usd);

    public static readonly Currency Yen = new(Values.Yen);

    public Currency(string value)
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
    public static Currency FromCustom(string value)
    {
        return new Currency(value);
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

    public static bool operator ==(Currency value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(Currency value1, string value2) => !value1.Value.Equals(value2);

    public static explicit operator string(Currency value) => value.Value;

    public static explicit operator Currency(string value) => new(value);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string Usd = "USD";

        public const string Yen = "YEN";
    }
}
