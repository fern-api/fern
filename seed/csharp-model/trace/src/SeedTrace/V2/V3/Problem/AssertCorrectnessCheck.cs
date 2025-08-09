// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2.V3;

[JsonConverter(typeof(JsonConverter))]
[Serializable]
public record AssertCorrectnessCheck
{
    internal AssertCorrectnessCheck(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of AssertCorrectnessCheck with <see cref="DeepEquality"/>.
    /// </summary>
    public AssertCorrectnessCheck(DeepEquality value)
    {
        Type = "deepEquality";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of AssertCorrectnessCheck with <see cref="Custom"/>.
    /// </summary>
    public AssertCorrectnessCheck(Custom value)
    {
        Type = "custom";
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
    /// Returns true if <see cref="Type"/> is "deepEquality"
    /// </summary>
    public bool IsDeepEquality => Type == "deepEquality";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "custom"
    /// </summary>
    public bool IsCustom => Type == "custom";

    /// <summary>
    /// Returns the value as a <see cref="DeepEqualityCorrectnessCheck"/> if <see cref="Type"/> is 'deepEquality', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'deepEquality'.</exception>
    public DeepEqualityCorrectnessCheck AsDeepEquality() =>
        IsDeepEquality
            ? (DeepEqualityCorrectnessCheck)Value!
            : throw new Exception(
                "SeedTrace.V2.V3.AssertCorrectnessCheck.Type is not 'deepEquality'"
            );

    /// <summary>
    /// Returns the value as a <see cref="VoidFunctionDefinitionThatTakesActualResult"/> if <see cref="Type"/> is 'custom', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'custom'.</exception>
    public VoidFunctionDefinitionThatTakesActualResult AsCustom() =>
        IsCustom
            ? (VoidFunctionDefinitionThatTakesActualResult)Value!
            : throw new Exception("SeedTrace.V2.V3.AssertCorrectnessCheck.Type is not 'custom'");

    public T Match<T>(
        Func<DeepEqualityCorrectnessCheck, T> onDeepEquality,
        Func<VoidFunctionDefinitionThatTakesActualResult, T> onCustom,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "deepEquality" => onDeepEquality(AsDeepEquality()),
            "custom" => onCustom(AsCustom()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<DeepEqualityCorrectnessCheck> onDeepEquality,
        Action<VoidFunctionDefinitionThatTakesActualResult> onCustom,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "deepEquality":
                onDeepEquality(AsDeepEquality());
                break;
            case "custom":
                onCustom(AsCustom());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="DeepEqualityCorrectnessCheck"/> and returns true if successful.
    /// </summary>
    public bool TryAsDeepEquality(out DeepEqualityCorrectnessCheck? value)
    {
        if (Type == "deepEquality")
        {
            value = (DeepEqualityCorrectnessCheck)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="VoidFunctionDefinitionThatTakesActualResult"/> and returns true if successful.
    /// </summary>
    public bool TryAsCustom(out VoidFunctionDefinitionThatTakesActualResult? value)
    {
        if (Type == "custom")
        {
            value = (VoidFunctionDefinitionThatTakesActualResult)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator AssertCorrectnessCheck(DeepEquality value) => new(value);

    public static implicit operator AssertCorrectnessCheck(Custom value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<AssertCorrectnessCheck>
    {
        public override bool CanConvert(Type typeToConvert) =>
            typeof(AssertCorrectnessCheck).IsAssignableFrom(typeToConvert);

        public override AssertCorrectnessCheck Read(
            ref Utf8JsonReader reader,
            Type typeToConvert,
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
                "deepEquality" => json.Deserialize<DeepEqualityCorrectnessCheck>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.V2.V3.DeepEqualityCorrectnessCheck"
                    ),
                "custom" => json.Deserialize<VoidFunctionDefinitionThatTakesActualResult>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.V2.V3.VoidFunctionDefinitionThatTakesActualResult"
                    ),
                _ => json.Deserialize<object?>(options),
            };
            return new AssertCorrectnessCheck(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            AssertCorrectnessCheck value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "deepEquality" => JsonSerializer.SerializeToNode(value.Value, options),
                    "custom" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for deepEquality
    /// </summary>
    [Serializable]
    public struct DeepEquality
    {
        public DeepEquality(DeepEqualityCorrectnessCheck value)
        {
            Value = value;
        }

        internal DeepEqualityCorrectnessCheck Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator DeepEquality(DeepEqualityCorrectnessCheck value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for custom
    /// </summary>
    [Serializable]
    public struct Custom
    {
        public Custom(VoidFunctionDefinitionThatTakesActualResult value)
        {
            Value = value;
        }

        internal VoidFunctionDefinitionThatTakesActualResult Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator Custom(VoidFunctionDefinitionThatTakesActualResult value) =>
            new(value);
    }
}
