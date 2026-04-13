using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(BadRequestErrorBodyErrorName.BadRequestErrorBodyErrorNameSerializer))]
[Serializable]
public readonly record struct BadRequestErrorBodyErrorName : IStringEnum
{
    public static readonly BadRequestErrorBodyErrorName PropertyBasedErrorTest = new(
        Values.PropertyBasedErrorTest
    );

    public BadRequestErrorBodyErrorName(string value)
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
    public static BadRequestErrorBodyErrorName FromCustom(string value)
    {
        return new BadRequestErrorBodyErrorName(value);
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

    public static bool operator ==(BadRequestErrorBodyErrorName value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(BadRequestErrorBodyErrorName value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(BadRequestErrorBodyErrorName value) => value.Value;

    public static explicit operator BadRequestErrorBodyErrorName(string value) => new(value);

    internal class BadRequestErrorBodyErrorNameSerializer
        : JsonConverter<BadRequestErrorBodyErrorName>
    {
        public override BadRequestErrorBodyErrorName Read(
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
            return new BadRequestErrorBodyErrorName(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            BadRequestErrorBodyErrorName value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override BadRequestErrorBodyErrorName ReadAsPropertyName(
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
            return new BadRequestErrorBodyErrorName(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            BadRequestErrorBodyErrorName value,
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
        public const string PropertyBasedErrorTest = "PropertyBasedErrorTest";
    }
}
