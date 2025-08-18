using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Types.Enum;

[System.Text.Json.Serialization.JsonConverter(
    typeof(SeedExhaustive.Core.StringEnumSerializer<SeedExhaustive.Types.Enum.WeatherReport>)
)]
[System.Serializable]
public readonly record struct WeatherReport : SeedExhaustive.Core.IStringEnum
{
    public static readonly SeedExhaustive.Types.Enum.WeatherReport Sunny = new(Values.Sunny);

    public static readonly SeedExhaustive.Types.Enum.WeatherReport Cloudy = new(Values.Cloudy);

    public static readonly SeedExhaustive.Types.Enum.WeatherReport Raining = new(Values.Raining);

    public static readonly SeedExhaustive.Types.Enum.WeatherReport Snowing = new(Values.Snowing);

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
    public static SeedExhaustive.Types.Enum.WeatherReport FromCustom(string value)
    {
        return new SeedExhaustive.Types.Enum.WeatherReport(value);
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

    public static bool operator ==(SeedExhaustive.Types.Enum.WeatherReport value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(SeedExhaustive.Types.Enum.WeatherReport value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(SeedExhaustive.Types.Enum.WeatherReport value) =>
        value.Value;

    public static explicit operator SeedExhaustive.Types.Enum.WeatherReport(string value) =>
        new(value);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [System.Serializable]
    public static class Values
    {
        public const string Sunny = "SUNNY";

        public const string Cloudy = "CLOUDY";

        public const string Raining = "RAINING";

        public const string Snowing = "SNOWING";
    }
}
