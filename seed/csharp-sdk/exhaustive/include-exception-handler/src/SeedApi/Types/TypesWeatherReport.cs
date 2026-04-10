using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(TypesWeatherReport.TypesWeatherReportSerializer))]
[Serializable]
public readonly record struct TypesWeatherReport : IStringEnum
{
    public static readonly TypesWeatherReport Sunny = new(Values.Sunny);

    public static readonly TypesWeatherReport Cloudy = new(Values.Cloudy);

    public static readonly TypesWeatherReport Raining = new(Values.Raining);

    public static readonly TypesWeatherReport Snowing = new(Values.Snowing);

    public TypesWeatherReport(string value)
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
    public static TypesWeatherReport FromCustom(string value)
    {
        return new TypesWeatherReport(value);
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

    public static bool operator ==(TypesWeatherReport value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(TypesWeatherReport value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(TypesWeatherReport value) => value.Value;

    public static explicit operator TypesWeatherReport(string value) => new(value);

    internal class TypesWeatherReportSerializer : JsonConverter<TypesWeatherReport>
    {
        public override TypesWeatherReport Read(
            ref Utf8JsonReader reader,
            Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new global::System.Exception(
                    "The JSON value could not be read as a string."
                );
            return new TypesWeatherReport(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            TypesWeatherReport value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override TypesWeatherReport ReadAsPropertyName(
            ref Utf8JsonReader reader,
            Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new global::System.Exception(
                    "The JSON property name could not be read as a string."
                );
            return new TypesWeatherReport(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            TypesWeatherReport value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Value);
        }
    }

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
