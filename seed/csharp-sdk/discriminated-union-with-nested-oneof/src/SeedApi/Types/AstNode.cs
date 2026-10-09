// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(AstNode.JsonConverter))]
[Serializable]
public record AstNode
{
    internal AstNode(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of AstNode with <see cref="AstNode.Llm"/>.
    /// </summary>
    public AstNode(AstNode.Llm value)
    {
        Type = "llm";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of AstNode with <see cref="AstNode.Text"/>.
    /// </summary>
    public AstNode(AstNode.Text value)
    {
        Type = "text";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of AstNode with <see cref="AstNode.NullLiteral"/>.
    /// </summary>
    public AstNode(AstNode.NullLiteral value)
    {
        Type = "null_literal";
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
    /// Returns true if <see cref="Type"/> is "llm"
    /// </summary>
    public bool IsLlm => Type == "llm";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "text"
    /// </summary>
    public bool IsText => Type == "text";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "null_literal"
    /// </summary>
    public bool IsNullLiteral => Type == "null_literal";

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.AstNodeLlm"/> if <see cref="Type"/> is 'llm', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'llm'.</exception>
    public SeedApi.AstNodeLlm AsLlm() =>
        IsLlm
            ? (SeedApi.AstNodeLlm)Value!
            : throw new global::System.Exception("AstNode.Type is not 'llm'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.AstTextNode"/> if <see cref="Type"/> is 'text', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'text'.</exception>
    public SeedApi.AstTextNode AsText() =>
        IsText
            ? (SeedApi.AstTextNode)Value!
            : throw new global::System.Exception("AstNode.Type is not 'text'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.AstNullNode"/> if <see cref="Type"/> is 'null_literal', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'null_literal'.</exception>
    public SeedApi.AstNullNode AsNullLiteral() =>
        IsNullLiteral
            ? (SeedApi.AstNullNode)Value!
            : throw new global::System.Exception("AstNode.Type is not 'null_literal'");

    public T Match<T>(
        Func<SeedApi.AstNodeLlm, T> onLlm,
        Func<SeedApi.AstTextNode, T> onText,
        Func<SeedApi.AstNullNode, T> onNullLiteral,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "llm" => onLlm(AsLlm()),
            "text" => onText(AsText()),
            "null_literal" => onNullLiteral(AsNullLiteral()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedApi.AstNodeLlm> onLlm,
        Action<SeedApi.AstTextNode> onText,
        Action<SeedApi.AstNullNode> onNullLiteral,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "llm":
                onLlm(AsLlm());
                break;
            case "text":
                onText(AsText());
                break;
            case "null_literal":
                onNullLiteral(AsNullLiteral());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.AstNodeLlm"/> and returns true if successful.
    /// </summary>
    public bool TryAsLlm(out SeedApi.AstNodeLlm? value)
    {
        if (Type == "llm")
        {
            value = (SeedApi.AstNodeLlm)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.AstTextNode"/> and returns true if successful.
    /// </summary>
    public bool TryAsText(out SeedApi.AstTextNode? value)
    {
        if (Type == "text")
        {
            value = (SeedApi.AstTextNode)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.AstNullNode"/> and returns true if successful.
    /// </summary>
    public bool TryAsNullLiteral(out SeedApi.AstNullNode? value)
    {
        if (Type == "null_literal")
        {
            value = (SeedApi.AstNullNode)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator AstNode(AstNode.Llm value) => new(value);

    public static implicit operator AstNode(AstNode.Text value) => new(value);

    public static implicit operator AstNode(AstNode.NullLiteral value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<AstNode>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(AstNode).IsAssignableFrom(typeToConvert);

        public override AstNode Read(
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
                "llm" => jsonWithoutDiscriminator.Deserialize<SeedApi.AstNodeLlm?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedApi.AstNodeLlm"),
                "text" => jsonWithoutDiscriminator.Deserialize<SeedApi.AstTextNode?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedApi.AstTextNode"),
                "null_literal" => jsonWithoutDiscriminator.Deserialize<SeedApi.AstNullNode?>(
                    options
                ) ?? throw new JsonException("Failed to deserialize SeedApi.AstNullNode"),
                _ => json.Deserialize<object?>(options),
            };
            return new AstNode(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            AstNode value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "llm" => JsonSerializer.SerializeToNode(value.Value, options),
                    "text" => JsonSerializer.SerializeToNode(value.Value, options),
                    "null_literal" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }

        public override AstNode ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new AstNode(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            AstNode value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Type);
        }
    }

    /// <summary>
    /// Discriminated union type for llm
    /// </summary>
    [Serializable]
    public struct Llm
    {
        public Llm(SeedApi.AstNodeLlm value)
        {
            Value = value;
        }

        internal SeedApi.AstNodeLlm Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator AstNode.Llm(SeedApi.AstNodeLlm value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for text
    /// </summary>
    [Serializable]
    public struct Text
    {
        public Text(SeedApi.AstTextNode value)
        {
            Value = value;
        }

        internal SeedApi.AstTextNode Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator AstNode.Text(SeedApi.AstTextNode value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for null_literal
    /// </summary>
    [Serializable]
    public struct NullLiteral
    {
        public NullLiteral(SeedApi.AstNullNode value)
        {
            Value = value;
        }

        internal SeedApi.AstNullNode Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator AstNode.NullLiteral(SeedApi.AstNullNode value) =>
            new(value);
    }
}
