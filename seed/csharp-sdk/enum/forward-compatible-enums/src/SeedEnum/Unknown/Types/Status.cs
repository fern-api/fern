using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedEnum.Core;

namespace SeedEnum;

[JsonConverter(typeof(Status.StatusSerializer))]
[Serializable]
public readonly record struct Status : IStringEnum
{
    public static readonly Status Known = new(Values.Known);

    public static readonly Status Unknown = new(Values.Unknown);

    public Status(string value)
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
    public static Status FromCustom(string value)
    {
        return new Status(value);
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

    public static bool operator ==(Status value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(Status value1, string value2) => !value1.Value.Equals(value2);

    public static explicit operator string(Status value) => value.Value;

    public static explicit operator Status(string value) => new(value);

    internal class StatusSerializer : JsonConverter<Status>
    {
        public override Status Read(
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
            return new Status(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            Status value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override Status ReadAsPropertyName(
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
            return new Status(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Status value,
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
        public const string Known = "Known";

        public const string Unknown = "Unknown";
    }
}
