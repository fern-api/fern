using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(AstllmNodeWithSchemaType.AstllmNodeWithSchemaTypeSerializer))]
[Serializable]
public readonly record struct AstllmNodeWithSchemaType : IStringEnum
{
    public static readonly AstllmNodeWithSchemaType Llm = new(Values.Llm);

    public AstllmNodeWithSchemaType(string value)
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
    public static AstllmNodeWithSchemaType FromCustom(string value)
    {
        return new AstllmNodeWithSchemaType(value);
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

    public static bool operator ==(AstllmNodeWithSchemaType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(AstllmNodeWithSchemaType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(AstllmNodeWithSchemaType value) => value.Value;

    public static explicit operator AstllmNodeWithSchemaType(string value) => new(value);

    internal class AstllmNodeWithSchemaTypeSerializer : JsonConverter<AstllmNodeWithSchemaType>
    {
        public override AstllmNodeWithSchemaType Read(
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
            return new AstllmNodeWithSchemaType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            AstllmNodeWithSchemaType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override AstllmNodeWithSchemaType ReadAsPropertyName(
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
            return new AstllmNodeWithSchemaType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            AstllmNodeWithSchemaType value,
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
        public const string Llm = "llm";
    }
}
