using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(BreakStrength.BreakStrengthSerializer))]
[Serializable]
public readonly record struct BreakStrength : IStringEnum
{
    public static readonly BreakStrength None = new(Values.None);

    public static readonly BreakStrength XWeak = new(Values.XWeak);

    public static readonly BreakStrength Weak = new(Values.Weak);

    public static readonly BreakStrength Medium = new(Values.Medium);

    public static readonly BreakStrength Strong = new(Values.Strong);

    public static readonly BreakStrength XStrong = new(Values.XStrong);

    public BreakStrength(string value)
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
    public static BreakStrength FromCustom(string value)
    {
        return new BreakStrength(value);
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

    public static bool operator ==(BreakStrength value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(BreakStrength value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(BreakStrength value) => value.Value;

    public static explicit operator BreakStrength(string value) => new(value);

    internal class BreakStrengthSerializer : JsonConverter<BreakStrength>
    {
        public override BreakStrength Read(
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
            return new BreakStrength(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            BreakStrength value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override BreakStrength ReadAsPropertyName(
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
            return new BreakStrength(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            BreakStrength value,
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
        public const string None = "none";

        public const string XWeak = "x-weak";

        public const string Weak = "weak";

        public const string Medium = "medium";

        public const string Strong = "strong";

        public const string XStrong = "x-strong";
    }
}
