using System.Text.Json;
using System.Text.Json.Serialization;
using SeedFileUpload.Core;

namespace SeedFileUpload;

[JsonConverter(typeof(OpenEnumType.OpenEnumTypeSerializer))]
[Serializable]
public readonly record struct OpenEnumType : IStringEnum
{
    public static readonly OpenEnumType OptionA = new(Values.OptionA);

    public static readonly OpenEnumType OptionB = new(Values.OptionB);

    public static readonly OpenEnumType OptionC = new(Values.OptionC);

    public OpenEnumType(string value)
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
    public static OpenEnumType FromCustom(string value)
    {
        return new OpenEnumType(value);
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

    public static bool operator ==(OpenEnumType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(OpenEnumType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(OpenEnumType value) => value.Value;

    public static explicit operator OpenEnumType(string value) => new(value);

    internal class OpenEnumTypeSerializer : JsonConverter<OpenEnumType>
    {
        public override OpenEnumType Read(
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
            return new OpenEnumType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            OpenEnumType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override OpenEnumType ReadAsPropertyName(
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
            return new OpenEnumType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            OpenEnumType value,
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
        public const string OptionA = "OPTION_A";

        public const string OptionB = "OPTION_B";

        public const string OptionC = "OPTION_C";
    }
}
