using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(PlantPostWateringFrequency.PlantPostWateringFrequencySerializer))]
[Serializable]
public readonly record struct PlantPostWateringFrequency : IStringEnum
{
    public static readonly PlantPostWateringFrequency Daily = new(Values.Daily);

    public static readonly PlantPostWateringFrequency Weekly = new(Values.Weekly);

    public static readonly PlantPostWateringFrequency Biweekly = new(Values.Biweekly);

    public static readonly PlantPostWateringFrequency Monthly = new(Values.Monthly);

    public PlantPostWateringFrequency(string value)
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
    public static PlantPostWateringFrequency FromCustom(string value)
    {
        return new PlantPostWateringFrequency(value);
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

    public static bool operator ==(PlantPostWateringFrequency value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(PlantPostWateringFrequency value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(PlantPostWateringFrequency value) => value.Value;

    public static explicit operator PlantPostWateringFrequency(string value) => new(value);

    internal class PlantPostWateringFrequencySerializer : JsonConverter<PlantPostWateringFrequency>
    {
        public override PlantPostWateringFrequency Read(
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
            return new PlantPostWateringFrequency(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            PlantPostWateringFrequency value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override PlantPostWateringFrequency ReadAsPropertyName(
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
            return new PlantPostWateringFrequency(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            PlantPostWateringFrequency value,
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
