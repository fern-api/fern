using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(PlantPostSunExposure.PlantPostSunExposureSerializer))]
[Serializable]
public readonly record struct PlantPostSunExposure : IStringEnum
{
    public static readonly PlantPostSunExposure Full = new(Values.Full);

    public static readonly PlantPostSunExposure Partial = new(Values.Partial);

    public static readonly PlantPostSunExposure Shade = new(Values.Shade);

    public PlantPostSunExposure(string value)
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
    public static PlantPostSunExposure FromCustom(string value)
    {
        return new PlantPostSunExposure(value);
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

    public static bool operator ==(PlantPostSunExposure value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(PlantPostSunExposure value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(PlantPostSunExposure value) => value.Value;

    public static explicit operator PlantPostSunExposure(string value) => new(value);

    internal class PlantPostSunExposureSerializer : JsonConverter<PlantPostSunExposure>
    {
        public override PlantPostSunExposure Read(
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
            return new PlantPostSunExposure(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            PlantPostSunExposure value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override PlantPostSunExposure ReadAsPropertyName(
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
            return new PlantPostSunExposure(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            PlantPostSunExposure value,
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
        public const string Full = "full";

        public const string Partial = "partial";

        public const string Shade = "shade";
    }
}
