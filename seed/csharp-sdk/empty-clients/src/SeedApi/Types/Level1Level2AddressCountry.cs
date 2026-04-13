using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(Level1Level2AddressCountry.Level1Level2AddressCountrySerializer))]
[Serializable]
public readonly record struct Level1Level2AddressCountry : IStringEnum
{
    public static readonly Level1Level2AddressCountry Usa = new(Values.Usa);

    public Level1Level2AddressCountry(string value)
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
    public static Level1Level2AddressCountry FromCustom(string value)
    {
        return new Level1Level2AddressCountry(value);
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

    public static bool operator ==(Level1Level2AddressCountry value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(Level1Level2AddressCountry value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(Level1Level2AddressCountry value) => value.Value;

    public static explicit operator Level1Level2AddressCountry(string value) => new(value);

    internal class Level1Level2AddressCountrySerializer : JsonConverter<Level1Level2AddressCountry>
    {
        public override Level1Level2AddressCountry Read(
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
            return new Level1Level2AddressCountry(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            Level1Level2AddressCountry value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override Level1Level2AddressCountry ReadAsPropertyName(
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
            return new Level1Level2AddressCountry(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Level1Level2AddressCountry value,
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
