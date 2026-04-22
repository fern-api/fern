using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(SubmissionTypeEnum.SubmissionTypeEnumSerializer))]
[Serializable]
public readonly record struct SubmissionTypeEnum : IStringEnum
{
    public static readonly SubmissionTypeEnum Test = new(Values.Test);

    public SubmissionTypeEnum(string value)
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
    public static SubmissionTypeEnum FromCustom(string value)
    {
        return new SubmissionTypeEnum(value);
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

    public static bool operator ==(SubmissionTypeEnum value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(SubmissionTypeEnum value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(SubmissionTypeEnum value) => value.Value;

    public static explicit operator SubmissionTypeEnum(string value) => new(value);

    internal class SubmissionTypeEnumSerializer : JsonConverter<SubmissionTypeEnum>
    {
        public override SubmissionTypeEnum Read(
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
            return new SubmissionTypeEnum(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            SubmissionTypeEnum value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override SubmissionTypeEnum ReadAsPropertyName(
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
            return new SubmissionTypeEnum(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            SubmissionTypeEnum value,
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
        public const string Test = "TEST";
    }
}
