// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Types;

[JsonConverter(typeof(Animal.JsonConverter))]
[Serializable]
public record Animal
{
    internal Animal(string type, object? value)
    {
        Animal_ = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of Animal with <see cref="Animal.Dog"/>.
    /// </summary>
    public Animal(Animal.Dog value)
    {
        Animal_ = "dog";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of Animal with <see cref="Animal.Cat"/>.
    /// </summary>
    public Animal(Animal.Cat value)
    {
        Animal_ = "cat";
        Value = value.Value;
    }

    /// <summary>
    /// Discriminant value
    /// </summary>
    [JsonPropertyName("animal")]
    public string Animal_ { get; internal set; }

    /// <summary>
    /// Discriminated union value
    /// </summary>
    public object? Value { get; internal set; }

    /// <summary>
    /// Returns true if <see cref="Animal_"/> is "dog"
    /// </summary>
    public bool IsDog => Animal_ == "dog";

    /// <summary>
    /// Returns true if <see cref="Animal_"/> is "cat"
    /// </summary>
    public bool IsCat => Animal_ == "cat";

    /// <summary>
    /// Returns the value as a <see cref="SeedExhaustive.Types.Dog"/> if <see cref="Animal_"/> is 'dog', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Animal_"/> is not 'dog'.</exception>
    public SeedExhaustive.Types.Dog AsDog() =>
        IsDog
            ? (SeedExhaustive.Types.Dog)Value!
            : throw new System.Exception("Animal.Animal_ is not 'dog'");

    /// <summary>
    /// Returns the value as a <see cref="SeedExhaustive.Types.Cat"/> if <see cref="Animal_"/> is 'cat', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Animal_"/> is not 'cat'.</exception>
    public SeedExhaustive.Types.Cat AsCat() =>
        IsCat
            ? (SeedExhaustive.Types.Cat)Value!
            : throw new System.Exception("Animal.Animal_ is not 'cat'");

    public T Match<T>(
        Func<SeedExhaustive.Types.Dog, T> onDog,
        Func<SeedExhaustive.Types.Cat, T> onCat,
        Func<string, object?, T> onUnknown_
    )
    {
        return Animal_ switch
        {
            "dog" => onDog(AsDog()),
            "cat" => onCat(AsCat()),
            _ => onUnknown_(Animal_, Value),
        };
    }

    public void Visit(
        Action<SeedExhaustive.Types.Dog> onDog,
        Action<SeedExhaustive.Types.Cat> onCat,
        Action<string, object?> onUnknown_
    )
    {
        switch (Animal_)
        {
            case "dog":
                onDog(AsDog());
                break;
            case "cat":
                onCat(AsCat());
                break;
            default:
                onUnknown_(Animal_, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedExhaustive.Types.Dog"/> and returns true if successful.
    /// </summary>
    public bool TryAsDog(out SeedExhaustive.Types.Dog? value)
    {
        if (Animal_ == "dog")
        {
            value = (SeedExhaustive.Types.Dog)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedExhaustive.Types.Cat"/> and returns true if successful.
    /// </summary>
    public bool TryAsCat(out SeedExhaustive.Types.Cat? value)
    {
        if (Animal_ == "cat")
        {
            value = (SeedExhaustive.Types.Cat)Value!;
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
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(Animal).IsAssignableFrom(typeToConvert);

        public override Animal Read(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
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

            var value = discriminator switch
            {
                "dog" => json.Deserialize<SeedExhaustive.Types.Dog?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedExhaustive.Types.Dog"),
                "cat" => json.Deserialize<SeedExhaustive.Types.Cat?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedExhaustive.Types.Cat"),
                _ => json.Deserialize<object?>(options),
            };
            return new Animal(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            Animal value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Animal_ switch
                {
                    "dog" => JsonSerializer.SerializeToNode(value.Value, options),
                    "cat" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["animal"] = value.Animal_;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for dog
    /// </summary>
    [Serializable]
    public struct Dog
    {
        public Dog(SeedExhaustive.Types.Dog value)
        {
            Value = value;
        }

        internal SeedExhaustive.Types.Dog Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator Animal.Dog(SeedExhaustive.Types.Dog value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for cat
    /// </summary>
    [Serializable]
    public struct Cat
    {
        public Cat(SeedExhaustive.Types.Cat value)
        {
            Value = value;
        }

        internal SeedExhaustive.Types.Cat Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator Animal.Cat(SeedExhaustive.Types.Cat value) => new(value);
    }
}
