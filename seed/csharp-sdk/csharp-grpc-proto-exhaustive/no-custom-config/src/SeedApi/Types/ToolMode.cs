using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(ToolMode.ToolModeSerializer))]
[Serializable]
public readonly record struct ToolMode : IStringEnum
{
    public static readonly ToolMode ToolModeInvalid = new(Values.ToolModeInvalid);

    public static readonly ToolMode ToolModeAuto = new(Values.ToolModeAuto);

    public static readonly ToolMode ToolModeNone = new(Values.ToolModeNone);

    public static readonly ToolMode ToolModeRequired = new(Values.ToolModeRequired);

    public ToolMode(string value)
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
    public static ToolMode FromCustom(string value)
    {
        return new ToolMode(value);
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

    public static bool operator ==(ToolMode value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(ToolMode value1, string value2) => !value1.Value.Equals(value2);

    public static explicit operator string(ToolMode value) => value.Value;

    public static explicit operator ToolMode(string value) => new(value);

    internal class ToolModeSerializer : JsonConverter<ToolMode>
    {
        public override ToolMode Read(
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
            return new ToolMode(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            ToolMode value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override ToolMode ReadAsPropertyName(
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
            return new ToolMode(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ToolMode value,
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
        public const string ToolModeInvalid = "TOOL_MODE_INVALID";

        public const string ToolModeAuto = "TOOL_MODE_AUTO";

        public const string ToolModeNone = "TOOL_MODE_NONE";

        public const string ToolModeRequired = "TOOL_MODE_REQUIRED";
    }
}
