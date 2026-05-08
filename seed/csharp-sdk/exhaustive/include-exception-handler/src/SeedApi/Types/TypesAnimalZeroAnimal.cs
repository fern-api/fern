using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(TypesAnimalZeroAnimal.TypesAnimalZeroAnimalSerializer))]
[Serializable]
public readonly record struct TypesAnimalZeroAnimal : IStringEnum
{
    public static readonly TypesAnimalZeroAnimal Dog = new(Values.Dog);

    public TypesAnimalZeroAnimal(string value)
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
    public static TypesAnimalZeroAnimal FromCustom(string value)
    {
        return new TypesAnimalZeroAnimal(value);
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

    public static bool operator ==(TypesAnimalZeroAnimal value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(TypesAnimalZeroAnimal value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(TypesAnimalZeroAnimal value) => value.Value;

    public static explicit operator TypesAnimalZeroAnimal(string value) => new(value);

    internal class TypesAnimalZeroAnimalSerializer : JsonConverter<TypesAnimalZeroAnimal>
    {
        public override TypesAnimalZeroAnimal Read(
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
            return new TypesAnimalZeroAnimal(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            TypesAnimalZeroAnimal value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override TypesAnimalZeroAnimal ReadAsPropertyName(
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
            return new TypesAnimalZeroAnimal(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            TypesAnimalZeroAnimal value,
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
        public const string Dog = "dog";
    }
}
