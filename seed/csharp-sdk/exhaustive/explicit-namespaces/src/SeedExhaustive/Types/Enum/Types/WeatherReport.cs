using System;
using System.Text.Json.Serialization;
using SeedExhaustive.Core;

#nullable enable

namespace SeedExhaustive.Types.Enum;

[JsonConverter(typeof(StringEnumSerializer<WeatherReport>))]
public readonly struct WeatherReport : IStringEnum, IEquatable<WeatherReport>
{
    public WeatherReport(string value)
    {
        Value = value;
    }

    /// <summary>
    /// The string value of the enum.
    /// </summary>
    public string Value { get; }

    public static readonly WeatherReport Sunny = Custom(Values.Sunny);

    public static readonly WeatherReport Cloudy = Custom(Values.Cloudy);

    public static readonly WeatherReport Raining = Custom(Values.Raining);

    public static readonly WeatherReport Snowing = Custom(Values.Snowing);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    public static class Values
    {
        public const string Sunny = "SUNNY";

        public const string Cloudy = "CLOUDY";

        public const string Raining = "RAINING";

        public const string Snowing = "SNOWING";
    }

    /// <summary>
    /// Create a string enum with the given value.
    /// </summary>
    public static WeatherReport Custom(string value)
    {
        return new WeatherReport(value);
    }

    /// <summary>
    /// Returns the string value of the enum.
    /// </summary>
    public override string ToString()
    {
        return Value;
    }

    public bool Equals(WeatherReport other)
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
        return Equals((WeatherReport)obj);
    }

    public override int GetHashCode()
    {
        return Value.GetHashCode();
    }

    public static bool operator ==(WeatherReport value1, WeatherReport value2) =>
        value1.Equals(value2);

    public static bool operator !=(WeatherReport value1, WeatherReport value2) =>
        !(value1 == value2);

    public static bool operator ==(WeatherReport value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(WeatherReport value1, string value2) =>
        !value1.Value.Equals(value2);
}
