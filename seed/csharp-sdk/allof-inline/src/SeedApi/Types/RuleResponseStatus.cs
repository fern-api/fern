using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(RuleResponseStatus.RuleResponseStatusSerializer))]
[Serializable]
public readonly record struct RuleResponseStatus : IStringEnum
{
    public static readonly RuleResponseStatus Active = new(Values.Active);

    public static readonly RuleResponseStatus Inactive = new(Values.Inactive);

    public static readonly RuleResponseStatus Draft = new(Values.Draft);

    public RuleResponseStatus(string value)
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
    public static RuleResponseStatus FromCustom(string value)
    {
        return new RuleResponseStatus(value);
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

    public static bool operator ==(RuleResponseStatus value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(RuleResponseStatus value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(RuleResponseStatus value) => value.Value;

    public static explicit operator RuleResponseStatus(string value) => new(value);

    internal class RuleResponseStatusSerializer : JsonConverter<RuleResponseStatus>
    {
        public override RuleResponseStatus Read(
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
            return new RuleResponseStatus(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            RuleResponseStatus value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override RuleResponseStatus ReadAsPropertyName(
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
            return new RuleResponseStatus(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            RuleResponseStatus value,
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

        public const string Draft = "draft";
    }
}
