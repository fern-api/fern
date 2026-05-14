using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(
    typeof(RuleCreateRequestExecutionContext.RuleCreateRequestExecutionContextSerializer)
)]
[Serializable]
public readonly record struct RuleCreateRequestExecutionContext : IStringEnum
{
    public static readonly RuleCreateRequestExecutionContext Prod = new(Values.Prod);

    public static readonly RuleCreateRequestExecutionContext Staging = new(Values.Staging);

    public static readonly RuleCreateRequestExecutionContext Dev = new(Values.Dev);

    public RuleCreateRequestExecutionContext(string value)
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
    public static RuleCreateRequestExecutionContext FromCustom(string value)
    {
        return new RuleCreateRequestExecutionContext(value);
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

    public static bool operator ==(RuleCreateRequestExecutionContext value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(RuleCreateRequestExecutionContext value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(RuleCreateRequestExecutionContext value) => value.Value;

    public static explicit operator RuleCreateRequestExecutionContext(string value) => new(value);

    internal class RuleCreateRequestExecutionContextSerializer
        : JsonConverter<RuleCreateRequestExecutionContext>
    {
        public override RuleCreateRequestExecutionContext Read(
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
            return new RuleCreateRequestExecutionContext(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            RuleCreateRequestExecutionContext value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override RuleCreateRequestExecutionContext ReadAsPropertyName(
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
            return new RuleCreateRequestExecutionContext(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            RuleCreateRequestExecutionContext value,
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
