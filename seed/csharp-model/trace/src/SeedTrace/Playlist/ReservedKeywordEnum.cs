using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(ReservedKeywordEnum.ReservedKeywordEnumSerializer))]
[Serializable]
public readonly record struct ReservedKeywordEnum : IStringEnum
{
    public static readonly ReservedKeywordEnum Is = new(Values.Is);

    public static readonly ReservedKeywordEnum As = new(Values.As);

    public ReservedKeywordEnum(string value)
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
    public static ReservedKeywordEnum FromCustom(string value)
    {
        return new ReservedKeywordEnum(value);
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

    public static bool operator ==(ReservedKeywordEnum value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(ReservedKeywordEnum value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(ReservedKeywordEnum value) => value.Value;

    public static explicit operator ReservedKeywordEnum(string value) => new(value);

    internal class ReservedKeywordEnumSerializer : JsonConverter<ReservedKeywordEnum>
    {
        public override ReservedKeywordEnum Read(
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
            return new ReservedKeywordEnum(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            ReservedKeywordEnum value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override ReservedKeywordEnum ReadAsPropertyName(
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
            return new ReservedKeywordEnum(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ReservedKeywordEnum value,
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
        public const string Is = "is";

        public const string As = "as";
    }
}
