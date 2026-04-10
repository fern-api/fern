using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(ModelType.ModelTypeSerializer))]
[Serializable]
public readonly record struct ModelType : IStringEnum
{
    public static readonly ModelType ModelV1 = new(Values.ModelV1);

    public ModelType(string value)
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
    public static ModelType FromCustom(string value)
    {
        return new ModelType(value);
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

    public static bool operator ==(ModelType value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(ModelType value1, string value2) => !value1.Value.Equals(value2);

    public static explicit operator string(ModelType value) => value.Value;

    public static explicit operator ModelType(string value) => new(value);

    internal class ModelTypeSerializer : JsonConverter<ModelType>
    {
        public override ModelType Read(
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
            return new ModelType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            ModelType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override ModelType ReadAsPropertyName(
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
            return new ModelType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ModelType value,
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
        public const string ModelV1 = "model_v1";
    }
}
