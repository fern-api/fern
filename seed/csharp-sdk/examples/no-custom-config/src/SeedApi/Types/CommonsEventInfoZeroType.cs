using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(CommonsEventInfoZeroType.CommonsEventInfoZeroTypeSerializer))]
[Serializable]
public readonly record struct CommonsEventInfoZeroType : IStringEnum
{
    public static readonly CommonsEventInfoZeroType Metadata = new(Values.Metadata);

    public CommonsEventInfoZeroType(string value)
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
    public static CommonsEventInfoZeroType FromCustom(string value)
    {
        return new CommonsEventInfoZeroType(value);
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

    public static bool operator ==(CommonsEventInfoZeroType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(CommonsEventInfoZeroType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(CommonsEventInfoZeroType value) => value.Value;

    public static explicit operator CommonsEventInfoZeroType(string value) => new(value);

    internal class CommonsEventInfoZeroTypeSerializer : JsonConverter<CommonsEventInfoZeroType>
    {
        public override CommonsEventInfoZeroType Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new global::System.Exception(
                    "The JSON value could not be read as a string."
                );
            return new CommonsEventInfoZeroType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            CommonsEventInfoZeroType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override CommonsEventInfoZeroType ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new global::System.Exception(
                    "The JSON property name could not be read as a string."
                );
            return new CommonsEventInfoZeroType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            CommonsEventInfoZeroType value,
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
        public const string Metadata = "metadata";
    }
}
