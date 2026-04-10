using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(PractitionerResourceType.PractitionerResourceTypeSerializer))]
[Serializable]
public readonly record struct PractitionerResourceType : IStringEnum
{
    public static readonly PractitionerResourceType Practitioner = new(Values.Practitioner);

    public PractitionerResourceType(string value)
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
    public static PractitionerResourceType FromCustom(string value)
    {
        return new PractitionerResourceType(value);
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

    public static bool operator ==(PractitionerResourceType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(PractitionerResourceType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(PractitionerResourceType value) => value.Value;

    public static explicit operator PractitionerResourceType(string value) => new(value);

    internal class PractitionerResourceTypeSerializer : JsonConverter<PractitionerResourceType>
    {
        public override PractitionerResourceType Read(
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
            return new PractitionerResourceType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            PractitionerResourceType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override PractitionerResourceType ReadAsPropertyName(
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
            return new PractitionerResourceType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            PractitionerResourceType value,
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
        public const string Practitioner = "Practitioner";
    }
}
