// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(TypesAnimal.JsonConverter))]
[Serializable]
public class TypesAnimal
{
    private TypesAnimal(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Type discriminator
    /// </summary>
    [JsonIgnore]
    public string Type { get; internal set; }

    /// <summary>
    /// Union value
    /// </summary>
    [JsonIgnore]
    public object? Value { get; internal set; }

    /// <summary>
    /// Factory method to create a union from a SeedApi.TypesAnimalZero value.
    /// </summary>
    public static TypesAnimal FromTypesAnimalZero(SeedApi.TypesAnimalZero value) =>
        new("typesAnimalZero", value);

    /// <summary>
    /// Factory method to create a union from a SeedApi.TypesAnimalOne value.
    /// </summary>
    public static TypesAnimal FromTypesAnimalOne(SeedApi.TypesAnimalOne value) =>
        new("typesAnimalOne", value);

    /// <summary>
    /// Returns true if <see cref="Type"/> is "typesAnimalZero"
    /// </summary>
    public bool IsTypesAnimalZero() => Type == "typesAnimalZero";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "typesAnimalOne"
    /// </summary>
    public bool IsTypesAnimalOne() => Type == "typesAnimalOne";

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.TypesAnimalZero"/> if <see cref="Type"/> is 'typesAnimalZero', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedApiException">Thrown when <see cref="Type"/> is not 'typesAnimalZero'.</exception>
    public SeedApi.TypesAnimalZero AsTypesAnimalZero() =>
        IsTypesAnimalZero()
            ? (SeedApi.TypesAnimalZero)Value!
            : throw new SeedApiException("Union type is not 'typesAnimalZero'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.TypesAnimalOne"/> if <see cref="Type"/> is 'typesAnimalOne', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedApiException">Thrown when <see cref="Type"/> is not 'typesAnimalOne'.</exception>
    public SeedApi.TypesAnimalOne AsTypesAnimalOne() =>
        IsTypesAnimalOne()
            ? (SeedApi.TypesAnimalOne)Value!
            : throw new SeedApiException("Union type is not 'typesAnimalOne'");

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.TypesAnimalZero"/> and returns true if successful.
    /// </summary>
    public bool TryGetTypesAnimalZero(out SeedApi.TypesAnimalZero? value)
    {
        if (Type == "typesAnimalZero")
        {
            value = (SeedApi.TypesAnimalZero)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.TypesAnimalOne"/> and returns true if successful.
    /// </summary>
    public bool TryGetTypesAnimalOne(out SeedApi.TypesAnimalOne? value)
    {
        if (Type == "typesAnimalOne")
        {
            value = (SeedApi.TypesAnimalOne)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public T Match<T>(
        Func<SeedApi.TypesAnimalZero, T> onTypesAnimalZero,
        Func<SeedApi.TypesAnimalOne, T> onTypesAnimalOne
    )
    {
        return Type switch
        {
            "typesAnimalZero" => onTypesAnimalZero(AsTypesAnimalZero()),
            "typesAnimalOne" => onTypesAnimalOne(AsTypesAnimalOne()),
            _ => throw new SeedApiException($"Unknown union type: {Type}"),
        };
    }

    public void Visit(
        Action<SeedApi.TypesAnimalZero> onTypesAnimalZero,
        Action<SeedApi.TypesAnimalOne> onTypesAnimalOne
    )
    {
        switch (Type)
        {
            case "typesAnimalZero":
                onTypesAnimalZero(AsTypesAnimalZero());
                break;
            case "typesAnimalOne":
                onTypesAnimalOne(AsTypesAnimalOne());
                break;
            default:
                throw new SeedApiException($"Unknown union type: {Type}");
        }
    }

    public override int GetHashCode()
    {
        unchecked
        {
            var hashCode = Type.GetHashCode();
            if (Value != null)
            {
                hashCode = (hashCode * 397) ^ Value.GetHashCode();
            }
            return hashCode;
        }
    }

    public override bool Equals(object? obj)
    {
        if (obj is null)
            return false;
        if (ReferenceEquals(this, obj))
            return true;
        if (obj is not TypesAnimal other)
            return false;

        // Compare type discriminators
        if (Type != other.Type)
            return false;

        // Compare values using EqualityComparer for deep comparison
        return System.Collections.Generic.EqualityComparer<object?>.Default.Equals(
            Value,
            other.Value
        );
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator TypesAnimal(SeedApi.TypesAnimalZero value) =>
        new("typesAnimalZero", value);

    public static implicit operator TypesAnimal(SeedApi.TypesAnimalOne value) =>
        new("typesAnimalOne", value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<TypesAnimal>
    {
        public override TypesAnimal? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            if (reader.TokenType == JsonTokenType.StartObject)
            {
                var document = JsonDocument.ParseValue(ref reader);

                var types = new (string Key, System.Type Type)[]
                {
                    ("typesAnimalZero", typeof(SeedApi.TypesAnimalZero)),
                    ("typesAnimalOne", typeof(SeedApi.TypesAnimalOne)),
                };

                foreach (var (key, type) in types)
                {
                    try
                    {
                        var value = document.Deserialize(type, options);
                        if (value != null)
                        {
                            TypesAnimal result = new(key, value);
                            return result;
                        }
                    }
                    catch (JsonException)
                    {
                        // Try next type;
                    }
                }
            }

            throw new JsonException(
                $"Cannot deserialize JSON token {reader.TokenType} into TypesAnimal"
            );
        }

        public override void Write(
            Utf8JsonWriter writer,
            TypesAnimal value,
            JsonSerializerOptions options
        )
        {
            if (value == null)
            {
                writer.WriteNullValue();
                return;
            }

            value.Visit(
                obj => JsonSerializer.Serialize(writer, obj, options),
                obj => JsonSerializer.Serialize(writer, obj, options)
            );
        }

        public override TypesAnimal ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue = reader.GetString()!;
            TypesAnimal result = new("string", stringValue);
            return result;
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            TypesAnimal value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Value?.ToString() ?? "null");
        }
    }
}
