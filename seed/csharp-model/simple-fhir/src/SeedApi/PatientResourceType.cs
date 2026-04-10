using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(PatientResourceType.PatientResourceTypeSerializer))]
[Serializable]
public readonly record struct PatientResourceType : IStringEnum
{
    public static readonly PatientResourceType Patient = new(Values.Patient);

    public PatientResourceType(string value)
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
    public static PatientResourceType FromCustom(string value)
    {
        return new PatientResourceType(value);
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

    public static bool operator ==(PatientResourceType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(PatientResourceType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(PatientResourceType value) => value.Value;

    public static explicit operator PatientResourceType(string value) => new(value);

    internal class PatientResourceTypeSerializer : JsonConverter<PatientResourceType>
    {
        public override PatientResourceType Read(
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
            return new PatientResourceType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            PatientResourceType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override PatientResourceType ReadAsPropertyName(
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
            return new PatientResourceType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            PatientResourceType value,
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
        public const string Patient = "Patient";
    }
}
