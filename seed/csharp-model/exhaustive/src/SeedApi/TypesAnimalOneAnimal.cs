using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(TypesAnimalOneAnimal.TypesAnimalOneAnimalSerializer))]
[Serializable]
public readonly record struct TypesAnimalOneAnimal : IStringEnum
{
    public static readonly TypesAnimalOneAnimal Cat = new(Values.Cat);

    public TypesAnimalOneAnimal(string value)
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
    public static TypesAnimalOneAnimal FromCustom(string value)
    {
        return new TypesAnimalOneAnimal(value);
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

    public static bool operator ==(TypesAnimalOneAnimal value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(TypesAnimalOneAnimal value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(TypesAnimalOneAnimal value) => value.Value;

    public static explicit operator TypesAnimalOneAnimal(string value) => new(value);

    internal class TypesAnimalOneAnimalSerializer : JsonConverter<TypesAnimalOneAnimal>
    {
        public override TypesAnimalOneAnimal Read(
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
            return new TypesAnimalOneAnimal(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            TypesAnimalOneAnimal value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override TypesAnimalOneAnimal ReadAsPropertyName(
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
            return new TypesAnimalOneAnimal(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            TypesAnimalOneAnimal value,
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
        public const string Cat = "cat";
    }
}
