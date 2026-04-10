using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(TypeEighteen.TypeEighteenSerializer))]
[Serializable]
public readonly record struct TypeEighteen : IStringEnum
{
    public static readonly TypeEighteen Eighteen = new(Values.Eighteen);

    public TypeEighteen(string value)
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
    public static TypeEighteen FromCustom(string value)
    {
        return new TypeEighteen(value);
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

    public static bool operator ==(TypeEighteen value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(TypeEighteen value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(TypeEighteen value) => value.Value;

    public static explicit operator TypeEighteen(string value) => new(value);

    internal class TypeEighteenSerializer : JsonConverter<TypeEighteen>
    {
        public override TypeEighteen Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new global::System.Exception(
                    "The JSON value could not be read as a string."
                );
            return new TypeEighteen(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            TypeEighteen value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override TypeEighteen ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new global::System.Exception(
                    "The JSON property name could not be read as a string."
                );
            return new TypeEighteen(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            TypeEighteen value,
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
        public const string Eighteen = "eighteen";
    }
}
