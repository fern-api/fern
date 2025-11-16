// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2.V3;

[JsonConverter(typeof(FunctionSignature.JsonConverter))]
[Serializable]
public record FunctionSignature
{
    internal FunctionSignature(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of FunctionSignature with <see cref="FunctionSignature.Void"/>.
    /// </summary>
    public FunctionSignature(FunctionSignature.Void value)
    {
        Type = "void";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of FunctionSignature with <see cref="FunctionSignature.NonVoid"/>.
    /// </summary>
    public FunctionSignature(FunctionSignature.NonVoid value)
    {
        Type = "nonVoid";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of FunctionSignature with <see cref="FunctionSignature.VoidThatTakesActualResult"/>.
    /// </summary>
    public FunctionSignature(FunctionSignature.VoidThatTakesActualResult value)
    {
        Type = "voidThatTakesActualResult";
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
    /// Returns true if <see cref="Type"/> is "void"
    /// </summary>
    public bool IsVoid => Type == "void";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "nonVoid"
    /// </summary>
    public bool IsNonVoid => Type == "nonVoid";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "voidThatTakesActualResult"
    /// </summary>
    public bool IsVoidThatTakesActualResult => Type == "voidThatTakesActualResult";

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.V2.V3.VoidFunctionSignature"/> if <see cref="Type"/> is 'void', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'void'.</exception>
    public SeedTrace.V2.V3.VoidFunctionSignature AsVoid() =>
        IsVoid
            ? (SeedTrace.V2.V3.VoidFunctionSignature)Value!
            : throw new System.Exception("FunctionSignature.Type is not 'void'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.V2.V3.NonVoidFunctionSignature"/> if <see cref="Type"/> is 'nonVoid', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'nonVoid'.</exception>
    public SeedTrace.V2.V3.NonVoidFunctionSignature AsNonVoid() =>
        IsNonVoid
            ? (SeedTrace.V2.V3.NonVoidFunctionSignature)Value!
            : throw new System.Exception("FunctionSignature.Type is not 'nonVoid'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.V2.V3.VoidFunctionSignatureThatTakesActualResult"/> if <see cref="Type"/> is 'voidThatTakesActualResult', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'voidThatTakesActualResult'.</exception>
    public SeedTrace.V2.V3.VoidFunctionSignatureThatTakesActualResult AsVoidThatTakesActualResult() =>
        IsVoidThatTakesActualResult
            ? (SeedTrace.V2.V3.VoidFunctionSignatureThatTakesActualResult)Value!
            : throw new System.Exception(
                "FunctionSignature.Type is not 'voidThatTakesActualResult'"
            );

    public T Match<T>(
        Func<SeedTrace.V2.V3.VoidFunctionSignature, T> onVoid,
        Func<SeedTrace.V2.V3.NonVoidFunctionSignature, T> onNonVoid,
        Func<
            SeedTrace.V2.V3.VoidFunctionSignatureThatTakesActualResult,
            T
        > onVoidThatTakesActualResult,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "void" => onVoid(AsVoid()),
            "nonVoid" => onNonVoid(AsNonVoid()),
            "voidThatTakesActualResult" => onVoidThatTakesActualResult(
                AsVoidThatTakesActualResult()
            ),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedTrace.V2.V3.VoidFunctionSignature> onVoid,
        Action<SeedTrace.V2.V3.NonVoidFunctionSignature> onNonVoid,
        Action<SeedTrace.V2.V3.VoidFunctionSignatureThatTakesActualResult> onVoidThatTakesActualResult,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "void":
                onVoid(AsVoid());
                break;
            case "nonVoid":
                onNonVoid(AsNonVoid());
                break;
            case "voidThatTakesActualResult":
                onVoidThatTakesActualResult(AsVoidThatTakesActualResult());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.V2.V3.VoidFunctionSignature"/> and returns true if successful.
    /// </summary>
    public bool TryAsVoid(out SeedTrace.V2.V3.VoidFunctionSignature? value)
    {
        if (Type == "void")
        {
            value = (SeedTrace.V2.V3.VoidFunctionSignature)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.V2.V3.NonVoidFunctionSignature"/> and returns true if successful.
    /// </summary>
    public bool TryAsNonVoid(out SeedTrace.V2.V3.NonVoidFunctionSignature? value)
    {
        if (Type == "nonVoid")
        {
            value = (SeedTrace.V2.V3.NonVoidFunctionSignature)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.V2.V3.VoidFunctionSignatureThatTakesActualResult"/> and returns true if successful.
    /// </summary>
    public bool TryAsVoidThatTakesActualResult(
        out SeedTrace.V2.V3.VoidFunctionSignatureThatTakesActualResult? value
    )
    {
        if (Type == "voidThatTakesActualResult")
        {
            value = (SeedTrace.V2.V3.VoidFunctionSignatureThatTakesActualResult)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator FunctionSignature(FunctionSignature.Void value) => new(value);

    public static implicit operator FunctionSignature(FunctionSignature.NonVoid value) =>
        new(value);

    public static implicit operator FunctionSignature(
        FunctionSignature.VoidThatTakesActualResult value
    ) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<FunctionSignature>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(FunctionSignature).IsAssignableFrom(typeToConvert);

        public override FunctionSignature Read(
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
                "void" => json.Deserialize<SeedTrace.V2.V3.VoidFunctionSignature?>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.V2.V3.VoidFunctionSignature"
                    ),
                "nonVoid" => json.Deserialize<SeedTrace.V2.V3.NonVoidFunctionSignature?>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.V2.V3.NonVoidFunctionSignature"
                    ),
                "voidThatTakesActualResult" =>
                    json.Deserialize<SeedTrace.V2.V3.VoidFunctionSignatureThatTakesActualResult?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedTrace.V2.V3.VoidFunctionSignatureThatTakesActualResult"
                        ),
                _ => json.Deserialize<object?>(options),
            };
            return new FunctionSignature(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            FunctionSignature value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "void" => JsonSerializer.SerializeToNode(value.Value, options),
                    "nonVoid" => JsonSerializer.SerializeToNode(value.Value, options),
                    "voidThatTakesActualResult" => JsonSerializer.SerializeToNode(
                        value.Value,
                        options
                    ),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for void
    /// </summary>
    [Serializable]
    public struct Void
    {
        public Void(SeedTrace.V2.V3.VoidFunctionSignature value)
        {
            Value = value;
        }

        internal SeedTrace.V2.V3.VoidFunctionSignature Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator FunctionSignature.Void(
            SeedTrace.V2.V3.VoidFunctionSignature value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for nonVoid
    /// </summary>
    [Serializable]
    public struct NonVoid
    {
        public NonVoid(SeedTrace.V2.V3.NonVoidFunctionSignature value)
        {
            Value = value;
        }

        internal SeedTrace.V2.V3.NonVoidFunctionSignature Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator FunctionSignature.NonVoid(
            SeedTrace.V2.V3.NonVoidFunctionSignature value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for voidThatTakesActualResult
    /// </summary>
    [Serializable]
    public struct VoidThatTakesActualResult
    {
        public VoidThatTakesActualResult(
            SeedTrace.V2.V3.VoidFunctionSignatureThatTakesActualResult value
        )
        {
            Value = value;
        }

        internal SeedTrace.V2.V3.VoidFunctionSignatureThatTakesActualResult Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator FunctionSignature.VoidThatTakesActualResult(
            SeedTrace.V2.V3.VoidFunctionSignatureThatTakesActualResult value
        ) => new(value);
    }
}
