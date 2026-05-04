using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(RuleExecutionContext.RuleExecutionContextSerializer))]
[Serializable]
public readonly record struct RuleExecutionContext : IStringEnum
{
    public static readonly RuleExecutionContext Prod = new(Values.Prod);

    public static readonly RuleExecutionContext Staging = new(Values.Staging);

    public static readonly RuleExecutionContext Dev = new(Values.Dev);

    public RuleExecutionContext(string value)
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
    public static RuleExecutionContext FromCustom(string value)
    {
        return new RuleExecutionContext(value);
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

    public static bool operator ==(RuleExecutionContext value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(RuleExecutionContext value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(RuleExecutionContext value) => value.Value;

    public static explicit operator RuleExecutionContext(string value) => new(value);

    internal class RuleExecutionContextSerializer : JsonConverter<RuleExecutionContext>
    {
        public override RuleExecutionContext Read(
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
            return new RuleExecutionContext(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            RuleExecutionContext value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override RuleExecutionContext ReadAsPropertyName(
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
            return new RuleExecutionContext(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            RuleExecutionContext value,
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
        public const string Prod = "prod";

        public const string Staging = "staging";

        public const string Dev = "dev";
    }
}
