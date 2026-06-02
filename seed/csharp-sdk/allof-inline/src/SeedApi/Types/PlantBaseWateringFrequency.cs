using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(PlantBaseWateringFrequency.PlantBaseWateringFrequencySerializer))]
[Serializable]
public readonly record struct PlantBaseWateringFrequency : IStringEnum
{
    public static readonly PlantBaseWateringFrequency Daily = new(Values.Daily);

    public static readonly PlantBaseWateringFrequency Weekly = new(Values.Weekly);

    public static readonly PlantBaseWateringFrequency Biweekly = new(Values.Biweekly);

    public static readonly PlantBaseWateringFrequency Monthly = new(Values.Monthly);

    public PlantBaseWateringFrequency(string value)
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
    public static PlantBaseWateringFrequency FromCustom(string value)
    {
        return new PlantBaseWateringFrequency(value);
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

    public static bool operator ==(PlantBaseWateringFrequency value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(PlantBaseWateringFrequency value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(PlantBaseWateringFrequency value) => value.Value;

    public static explicit operator PlantBaseWateringFrequency(string value) => new(value);

    internal class PlantBaseWateringFrequencySerializer : JsonConverter<PlantBaseWateringFrequency>
    {
        public override PlantBaseWateringFrequency Read(
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
            return new PlantBaseWateringFrequency(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            PlantBaseWateringFrequency value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override PlantBaseWateringFrequency ReadAsPropertyName(
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
            return new PlantBaseWateringFrequency(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            PlantBaseWateringFrequency value,
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
        public const string Daily = "daily";

        public const string Weekly = "weekly";

        public const string Biweekly = "biweekly";

        public const string Monthly = "monthly";
    }
}
