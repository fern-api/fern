// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

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
    /// Returns the value as a <see cref="SeedApi.TestAnd"/> if <see cref="Type"/> is 'and', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'and'.</exception>
    public SeedApi.TestAnd AsAnd() =>
        IsAnd
            ? (SeedApi.TestAnd)Value!
            : throw new global::System.Exception("Test.Type is not 'and'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.TestOr"/> if <see cref="Type"/> is 'or', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'or'.</exception>
    public SeedApi.TestOr AsOr() =>
        IsOr ? (SeedApi.TestOr)Value! : throw new global::System.Exception("Test.Type is not 'or'");

    public T Match<T>(
        Func<SeedApi.TestAnd, T> onAnd,
        Func<SeedApi.TestOr, T> onOr,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "and" => onAnd(AsAnd()),
            "or" => onOr(AsOr()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedApi.TestAnd> onAnd,
        Action<SeedApi.TestOr> onOr,
        Action<string, object?> onUnknown_
    )
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
    /// Attempts to cast the value to a <see cref="SeedApi.TestAnd"/> and returns true if successful.
    /// </summary>
    public bool TryAsAnd(out SeedApi.TestAnd? value)
    {
        if (Type == "and")
        {
            value = (SeedApi.TestAnd)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.TestOr"/> and returns true if successful.
    /// </summary>
    public bool TryAsOr(out SeedApi.TestOr? value)
    {
        if (Type == "or")
        {
            value = (SeedApi.TestOr)Value!;
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
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Test).IsAssignableFrom(typeToConvert);

        public override Test Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
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

            // Strip the discriminant property to prevent it from leaking into AdditionalProperties
            var jsonObject = System.Text.Json.Nodes.JsonObject.Create(json);
            jsonObject?.Remove("type");
            var jsonWithoutDiscriminator =
                jsonObject != null ? JsonSerializer.SerializeToElement(jsonObject, options) : json;

            var value = discriminator switch
            {
                "and" => jsonWithoutDiscriminator.Deserialize<SeedApi.TestAnd?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedApi.TestAnd"),
                "or" => jsonWithoutDiscriminator.Deserialize<SeedApi.TestOr?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedApi.TestOr"),
                _ => json.Deserialize<object?>(options),
            };
            return new Test(discriminator, value);
        }

        public override void Write(Utf8JsonWriter writer, Test value, JsonSerializerOptions options)
        {
            JsonNode json =
                value.Type switch
                {
                    "and" => JsonSerializer.SerializeToNode(value.Value, options),
                    "or" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }

        public override Test ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new Test(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Test value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Type);
        }
    }

    /// <summary>
    /// Discriminated union type for and
    /// </summary>
    [Serializable]
    public struct And
    {
        public And(SeedApi.TestAnd value)
        {
            Value = value;
        }

        internal SeedApi.TestAnd Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator Test.And(SeedApi.TestAnd value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for or
    /// </summary>
    [Serializable]
    public struct Or
    {
        public Or(SeedApi.TestOr value)
        {
            Value = value;
        }

        internal SeedApi.TestOr Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator Test.Or(SeedApi.TestOr value) => new(value);
    }
}
