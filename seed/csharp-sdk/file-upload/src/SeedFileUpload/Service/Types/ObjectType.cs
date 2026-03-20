using System.Text.Json;
using System.Text.Json.Serialization;
using SeedFileUpload.Core;

namespace SeedFileUpload;

[JsonConverter(typeof(ObjectType.ObjectTypeSerializer))]
[Serializable]
public readonly record struct ObjectType : IStringEnum
{
    public static readonly ObjectType Foo = new(Values.Foo);

    public static readonly ObjectType Bar = new(Values.Bar);

    public ObjectType(string value)
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
    public static ObjectType FromCustom(string value)
    {
        return new ObjectType(value);
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

    public static bool operator ==(ObjectType value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(ObjectType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(ObjectType value) => value.Value;

    public static explicit operator ObjectType(string value) => new(value);

    internal class ObjectTypeSerializer : JsonConverter<ObjectType>
    {
        public override ObjectType Read(
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
            return new ObjectType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            ObjectType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override ObjectType ReadAsPropertyName(
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
            return new ObjectType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ObjectType value,
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
        public const string Foo = "FOO";

        public const string Bar = "BAR";
    }
}
