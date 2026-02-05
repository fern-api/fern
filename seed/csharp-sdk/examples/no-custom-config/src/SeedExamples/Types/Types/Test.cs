// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedExamples.Core;

namespace SeedExamples;

[JsonConverter(typeof(Test.JsonConverter))]
[Serializable]
public record Test
{
    internal Test(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of Test with <see cref="Test.And"/>.
    /// </summary>
    public Test(Test.And value)
    {
        Type = "and";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of Test with <see cref="Test.Or"/>.
    /// </summary>
    public Test(Test.Or value)
    {
        Type = "or";
        Value = value.Value;
    }

    /// <summary>
    /// Discriminant value
    /// </summary>
    [JsonPropertyName("type")]
    public string Type { get; internal set; }

    /// <summary>
    /// Discriminated union value
    /// </summary>
    public object? Value { get; internal set; }

    /// <summary>
    /// Returns true if <see cref="Type"/> is "and"
    /// </summary>
    public bool IsAnd => Type == "and";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "or"
    /// </summary>
    public bool IsOr => Type == "or";

    /// <summary>
    /// Returns the value as a <see cref="bool"/> if <see cref="Type"/> is 'and', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'and'.</exception>
    public bool AsAnd() =>
        IsAnd ? (bool)Value! : throw new System.Exception("Test.Type is not 'and'");

    /// <summary>
    /// Returns the value as a <see cref="bool"/> if <see cref="Type"/> is 'or', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'or'.</exception>
    public bool AsOr() => IsOr ? (bool)Value! : throw new System.Exception("Test.Type is not 'or'");

    public T Match<T>(Func<bool, T> onAnd, Func<bool, T> onOr, Func<string, object?, T> onUnknown_)
    {
        return Type switch
        {
            "and" => onAnd(AsAnd()),
            "or" => onOr(AsOr()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(Action<bool> onAnd, Action<bool> onOr, Action<string, object?> onUnknown_)
    {
        switch (Type)
        {
            case "and":
                onAnd(AsAnd());
                break;
            case "or":
                onOr(AsOr());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="bool"/> and returns true if successful.
    /// </summary>
    public bool TryAsAnd(out bool? value)
    {
        if (Type == "and")
        {
            value = (bool)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="bool"/> and returns true if successful.
    /// </summary>
    public bool TryAsOr(out bool? value)
    {
        if (Type == "or")
        {
            value = (bool)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator Test(Test.And value) => new(value);

    public static implicit operator Test(Test.Or value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Test>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(Test).IsAssignableFrom(typeToConvert);

        public override Test Read(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = JsonElement.ParseValue(ref reader);
            if (!json.TryGetProperty("type", out var discriminatorElement))
            {
                throw new JsonException("Missing discriminator property 'type'");
            }
            if (discriminatorElement.ValueKind != JsonValueKind.String)
            {
                if (discriminatorElement.ValueKind == JsonValueKind.Null)
                {
                    throw new JsonException("Discriminator property 'type' is null");
                }

                throw new JsonException(
                    $"Discriminator property 'type' is not a string, instead is {discriminatorElement.ToString()}"
                );
            }

            var discriminator =
                discriminatorElement.GetString()
                ?? throw new JsonException("Discriminator property 'type' is null");

            var value = discriminator switch
            {
                "and" => json.GetProperty("value").Deserialize<bool>(options),
                "or" => json.GetProperty("value").Deserialize<bool>(options),
                _ => json.Deserialize<object?>(options),
            };
            return new Test(discriminator, value);
        }

        public override void Write(Utf8JsonWriter writer, Test value, JsonSerializerOptions options)
        {
            JsonNode json =
                value.Type switch
                {
                    "and" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "or" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for and
    /// </summary>
    [Serializable]
    public struct And
    {
        public And(bool value)
        {
            Value = value;
        }

        internal bool Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator Test.And(bool value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for or
    /// </summary>
    [Serializable]
    public struct Or
    {
        public Or(bool value)
        {
            Value = value;
        }

        internal bool Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator Test.Or(bool value) => new(value);
    }
}
