using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(CommonsEventInfoTypeType.CommonsEventInfoTypeTypeSerializer))]
[Serializable]
public readonly record struct CommonsEventInfoTypeType : IStringEnum
{
    public static readonly CommonsEventInfoTypeType Tag = new(Values.Tag);

    public CommonsEventInfoTypeType(string value)
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
    public static CommonsEventInfoTypeType FromCustom(string value)
    {
        return new CommonsEventInfoTypeType(value);
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

    public static bool operator ==(CommonsEventInfoTypeType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(CommonsEventInfoTypeType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(CommonsEventInfoTypeType value) => value.Value;

    public static explicit operator CommonsEventInfoTypeType(string value) => new(value);

    internal class CommonsEventInfoTypeTypeSerializer : JsonConverter<CommonsEventInfoTypeType>
    {
        public override CommonsEventInfoTypeType Read(
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
            return new CommonsEventInfoTypeType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            CommonsEventInfoTypeType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override CommonsEventInfoTypeType ReadAsPropertyName(
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
            return new CommonsEventInfoTypeType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            CommonsEventInfoTypeType value,
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
        public const string Tag = "tag";
    }
}
