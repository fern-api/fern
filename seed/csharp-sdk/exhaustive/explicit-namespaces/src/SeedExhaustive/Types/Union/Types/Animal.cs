// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Types.Union;

[JsonConverter(typeof(Animal.JsonConverter))]
[Serializable]
public record Animal
{
    internal Animal(string type, object? value)
    {
        _Animal = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of Animal with <see cref="Animal.Dog"/>.
    /// </summary>
    public Animal(Animal.Dog value)
    {
        _Animal = "dog";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of Animal with <see cref="Animal.Cat"/>.
    /// </summary>
    public Animal(Animal.Cat value)
    {
        _Animal = "cat";
        Value = value.Value;
    }

    /// <summary>
    /// Discriminant value
    /// </summary>
    [JsonPropertyName("animal")]
    public string _Animal { get; internal set; }

    /// <summary>
    /// Discriminated union value
    /// </summary>
    public object? Value { get; internal set; }

    /// <summary>
    /// Returns true if <see cref="_Animal"/> is "dog"
    /// </summary>
    public bool IsDog => _Animal == "dog";

    /// <summary>
    /// Returns true if <see cref="_Animal"/> is "cat"
    /// </summary>
    public bool IsCat => _Animal == "cat";

    /// <summary>
    /// Returns the value as a <see cref="SeedExhaustive.Types.Union.Dog"/> if <see cref="_Animal"/> is 'dog', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="_Animal"/> is not 'dog'.</exception>
    public SeedExhaustive.Types.Union.Dog AsDog() =>
        IsDog
            ? (SeedExhaustive.Types.Union.Dog)Value!
            : throw new Exception("Animal._Animal is not 'dog'");

    /// <summary>
    /// Returns the value as a <see cref="SeedExhaustive.Types.Union.Cat"/> if <see cref="_Animal"/> is 'cat', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="_Animal"/> is not 'cat'.</exception>
    public SeedExhaustive.Types.Union.Cat AsCat() =>
        IsCat
            ? (SeedExhaustive.Types.Union.Cat)Value!
            : throw new Exception("Animal._Animal is not 'cat'");

    public T Match<T>(
        Func<SeedExhaustive.Types.Union.Dog, T> onDog,
        Func<SeedExhaustive.Types.Union.Cat, T> onCat,
        Func<string, object?, T> onUnknown_
    )
    {
        return _Animal switch
        {
            "dog" => onDog(AsDog()),
            "cat" => onCat(AsCat()),
            _ => onUnknown_(_Animal, Value),
        };
    }

    public void Visit(
        Action<SeedExhaustive.Types.Union.Dog> onDog,
        Action<SeedExhaustive.Types.Union.Cat> onCat,
        Action<string, object?> onUnknown_
    )
    {
        switch (_Animal)
        {
            case "dog":
                onDog(AsDog());
                break;
            case "cat":
                onCat(AsCat());
                break;
            default:
                onUnknown_(_Animal, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedExhaustive.Types.Union.Dog"/> and returns true if successful.
    /// </summary>
    public bool TryAsDog(out SeedExhaustive.Types.Union.Dog? value)
    {
        if (_Animal == "dog")
        {
            value = (SeedExhaustive.Types.Union.Dog)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedExhaustive.Types.Union.Cat"/> and returns true if successful.
    /// </summary>
    public bool TryAsCat(out SeedExhaustive.Types.Union.Cat? value)
    {
        if (_Animal == "cat")
        {
            value = (SeedExhaustive.Types.Union.Cat)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator Animal(Animal.Dog value) => new(value);

    public static implicit operator Animal(Animal.Cat value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Animal>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Animal).IsAssignableFrom(typeToConvert);

        public override Animal Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = JsonElement.ParseValue(ref reader);
            if (!json.TryGetProperty("animal", out var discriminatorElement))
            {
                throw new JsonException("Missing discriminator property 'animal'");
            }
            if (discriminatorElement.ValueKind != JsonValueKind.String)
            {
                if (discriminatorElement.ValueKind == JsonValueKind.Null)
                {
                    throw new JsonException("Discriminator property 'animal' is null");
                }

                throw new JsonException(
                    $"Discriminator property 'animal' is not a string, instead is {discriminatorElement.ToString()}"
                );
            }

            var discriminator =
                discriminatorElement.GetString()
                ?? throw new JsonException("Discriminator property 'animal' is null");

            var value =
                discriminator switch
                {
                    "dog" => json.Deserialize<SeedExhaustive.Types.Union.Dog>(options),
                    "cat" => json.Deserialize<SeedExhaustive.Types.Union.Cat>(options),
                    _ => json.Deserialize<object?>(options),
                }
                ?? throw new JsonException($"Failed to deserialize union value of {discriminator}");
            return new Animal(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            Animal value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value._Animal switch
                {
                    "dog" => JsonSerializer.SerializeToNode(value.Value, options),
                    "cat" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["animal"] = value._Animal;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for dog
    /// </summary>
    [Serializable]
    public struct Dog
    {
        public Dog(SeedExhaustive.Types.Union.Dog value)
        {
            Value = value;
        }

        internal SeedExhaustive.Types.Union.Dog Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator Dog(SeedExhaustive.Types.Union.Dog value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for cat
    /// </summary>
    [Serializable]
    public struct Cat
    {
        public Cat(SeedExhaustive.Types.Union.Cat value)
        {
            Value = value;
        }

        internal SeedExhaustive.Types.Union.Cat Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator Cat(SeedExhaustive.Types.Union.Cat value) => new(value);
    }
}
