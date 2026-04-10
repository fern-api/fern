using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(Level1AddressCountry.Level1AddressCountrySerializer))]
[Serializable]
public readonly record struct Level1AddressCountry : IStringEnum
{
    public static readonly Level1AddressCountry Usa = new(Values.Usa);

    public Level1AddressCountry(string value)
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
    public static Level1AddressCountry FromCustom(string value)
    {
        return new Level1AddressCountry(value);
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

    public static bool operator ==(Level1AddressCountry value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(Level1AddressCountry value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(Level1AddressCountry value) => value.Value;

    public static explicit operator Level1AddressCountry(string value) => new(value);

    internal class Level1AddressCountrySerializer : JsonConverter<Level1AddressCountry>
    {
        public override Level1AddressCountry Read(
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
            return new Level1AddressCountry(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            Level1AddressCountry value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override Level1AddressCountry ReadAsPropertyName(
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
            return new Level1AddressCountry(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Level1AddressCountry value,
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
        public const string Usa = "USA";
    }
}
