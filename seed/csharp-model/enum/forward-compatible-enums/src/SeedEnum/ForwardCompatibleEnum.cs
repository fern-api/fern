using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedEnum.Core;

namespace SeedEnum;

[JsonConverter(typeof(ForwardCompatibleEnum.ForwardCompatibleEnumSerializer))]
[Serializable]
public readonly record struct ForwardCompatibleEnum : IStringEnum
{
    public static readonly ForwardCompatibleEnum Active = new(Values.Active);

    public static readonly ForwardCompatibleEnum Inactive = new(Values.Inactive);

    public ForwardCompatibleEnum(string value)
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
    public static ForwardCompatibleEnum FromCustom(string value)
    {
        return new ForwardCompatibleEnum(value);
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

    public static bool operator ==(ForwardCompatibleEnum value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(ForwardCompatibleEnum value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(ForwardCompatibleEnum value) => value.Value;

    public static explicit operator ForwardCompatibleEnum(string value) => new(value);

    internal class ForwardCompatibleEnumSerializer : JsonConverter<ForwardCompatibleEnum>
    {
        public override ForwardCompatibleEnum Read(
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
            return new ForwardCompatibleEnum(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            ForwardCompatibleEnum value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override ForwardCompatibleEnum ReadAsPropertyName(
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
            return new ForwardCompatibleEnum(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ForwardCompatibleEnum value,
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
        public const string Active = "active";

        public const string Inactive = "inactive";
    }
}
