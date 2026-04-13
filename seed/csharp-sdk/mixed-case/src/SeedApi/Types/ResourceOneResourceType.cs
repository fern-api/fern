using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(ResourceOneResourceType.ResourceOneResourceTypeSerializer))]
[Serializable]
public readonly record struct ResourceOneResourceType : IStringEnum
{
    public static readonly ResourceOneResourceType Organization = new(Values.Organization);

    public ResourceOneResourceType(string value)
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
    public static ResourceOneResourceType FromCustom(string value)
    {
        return new ResourceOneResourceType(value);
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

    public static bool operator ==(ResourceOneResourceType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(ResourceOneResourceType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(ResourceOneResourceType value) => value.Value;

    public static explicit operator ResourceOneResourceType(string value) => new(value);

    internal class ResourceOneResourceTypeSerializer : JsonConverter<ResourceOneResourceType>
    {
        public override ResourceOneResourceType Read(
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
            return new ResourceOneResourceType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            ResourceOneResourceType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override ResourceOneResourceType ReadAsPropertyName(
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
            return new ResourceOneResourceType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ResourceOneResourceType value,
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
        public const string Organization = "Organization";
    }
}
