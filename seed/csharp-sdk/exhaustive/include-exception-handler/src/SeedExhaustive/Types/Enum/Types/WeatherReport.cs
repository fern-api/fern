using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Types;

[JsonConverter(typeof(StringEnumSerializer<WeatherReport>))]
[Serializable]
public readonly record struct WeatherReport : IStringEnum
{
    public static readonly WeatherReport Sunny = new(Values.Sunny);

    public static readonly WeatherReport Cloudy = new(Values.Cloudy);

    public static readonly WeatherReport Raining = new(Values.Raining);

    public static readonly WeatherReport Snowing = new(Values.Snowing);

    public WeatherReport(string value)
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
    public static WeatherReport FromCustom(string value)
    {
        return new WeatherReport(value);
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

    public static bool operator ==(WeatherReport value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(WeatherReport value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(WeatherReport value) => value.Value;

    public static explicit operator WeatherReport(string value) => new(value);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string Sunny = "SUNNY";

        public const string Cloudy = "CLOUDY";

        public const string Raining = "RAINING";

        public const string Snowing = "SNOWING";
    }
}
