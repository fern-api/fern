using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(Language.LanguageSerializer))]
[Serializable]
public readonly record struct Language : IStringEnum
{
    public static readonly Language Java = new(Values.Java);

    public static readonly Language Javascript = new(Values.Javascript);

    public static readonly Language Python = new(Values.Python);

    public Language(string value)
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
    public static Language FromCustom(string value)
    {
        return new Language(value);
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

    public static bool operator ==(Language value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(Language value1, string value2) => !value1.Value.Equals(value2);

    public static explicit operator string(Language value) => value.Value;

    public static explicit operator Language(string value) => new(value);

    internal class LanguageSerializer : JsonConverter<Language>
    {
        public override Language Read(
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
            return new Language(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            Language value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override Language ReadAsPropertyName(
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
            return new Language(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Language value,
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
        public const string Java = "JAVA";

        public const string Javascript = "JAVASCRIPT";

        public const string Python = "PYTHON";
    }
}
