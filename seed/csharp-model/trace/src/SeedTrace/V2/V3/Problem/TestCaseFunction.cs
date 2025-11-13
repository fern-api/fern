// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2.V3;

[JsonConverter(typeof(TestCaseFunction.JsonConverter))]
[Serializable]
public record TestCaseFunction
{
    internal TestCaseFunction(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of TestCaseFunction with <see cref="TestCaseFunction.WithActualResult"/>.
    /// </summary>
    public TestCaseFunction(TestCaseFunction.WithActualResult value)
    {
        Type = "withActualResult";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of TestCaseFunction with <see cref="TestCaseFunction.Custom"/>.
    /// </summary>
    public TestCaseFunction(TestCaseFunction.Custom value)
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
    /// Returns true if <see cref="Type"/> is "withActualResult"
    /// </summary>
    public bool IsWithActualResult => Type == "withActualResult";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "custom"
    /// </summary>
    public bool IsCustom => Type == "custom";

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.V2.V3.TestCaseWithActualResultImplementation"/> if <see cref="Type"/> is 'withActualResult', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'withActualResult'.</exception>
    public SeedTrace.V2.V3.TestCaseWithActualResultImplementation AsWithActualResult() =>
        IsWithActualResult
            ? (SeedTrace.V2.V3.TestCaseWithActualResultImplementation)Value!
            : throw new System.Exception("TestCaseFunction.Type is not 'withActualResult'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.V2.V3.VoidFunctionDefinition"/> if <see cref="Type"/> is 'custom', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'custom'.</exception>
    public SeedTrace.V2.V3.VoidFunctionDefinition AsCustom() =>
        IsCustom
            ? (SeedTrace.V2.V3.VoidFunctionDefinition)Value!
            : throw new System.Exception("TestCaseFunction.Type is not 'custom'");

    public T Match<T>(
        Func<SeedTrace.V2.V3.TestCaseWithActualResultImplementation, T> onWithActualResult,
        Func<SeedTrace.V2.V3.VoidFunctionDefinition, T> onCustom,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "withActualResult" => onWithActualResult(AsWithActualResult()),
            "custom" => onCustom(AsCustom()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedTrace.V2.V3.TestCaseWithActualResultImplementation> onWithActualResult,
        Action<SeedTrace.V2.V3.VoidFunctionDefinition> onCustom,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "withActualResult":
                onWithActualResult(AsWithActualResult());
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
    /// Attempts to cast the value to a <see cref="SeedTrace.V2.V3.TestCaseWithActualResultImplementation"/> and returns true if successful.
    /// </summary>
    public bool TryAsWithActualResult(
        out SeedTrace.V2.V3.TestCaseWithActualResultImplementation? value
    )
    {
        if (Type == "withActualResult")
        {
            value = (SeedTrace.V2.V3.TestCaseWithActualResultImplementation)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.V2.V3.VoidFunctionDefinition"/> and returns true if successful.
    /// </summary>
    public bool TryAsCustom(out SeedTrace.V2.V3.VoidFunctionDefinition? value)
    {
        if (Type == "custom")
        {
            value = (SeedTrace.V2.V3.VoidFunctionDefinition)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator TestCaseFunction(TestCaseFunction.WithActualResult value) =>
        new(value);

    public static implicit operator TestCaseFunction(TestCaseFunction.Custom value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<TestCaseFunction>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(TestCaseFunction).IsAssignableFrom(typeToConvert);

        public override TestCaseFunction Read(
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
                "withActualResult" =>
                    json.Deserialize<SeedTrace.V2.V3.TestCaseWithActualResultImplementation?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedTrace.V2.V3.TestCaseWithActualResultImplementation"
                        ),
                "custom" => json.Deserialize<SeedTrace.V2.V3.VoidFunctionDefinition?>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.V2.V3.VoidFunctionDefinition"
                    ),
                _ => json.Deserialize<object?>(options),
            };
            return new TestCaseFunction(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            TestCaseFunction value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "withActualResult" => JsonSerializer.SerializeToNode(value.Value, options),
                    "custom" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for withActualResult
    /// </summary>
    [Serializable]
    public struct WithActualResult
    {
        public WithActualResult(SeedTrace.V2.V3.TestCaseWithActualResultImplementation value)
        {
            Value = value;
        }

        internal SeedTrace.V2.V3.TestCaseWithActualResultImplementation Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator TestCaseFunction.WithActualResult(
            SeedTrace.V2.V3.TestCaseWithActualResultImplementation value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for custom
    /// </summary>
    [Serializable]
    public struct Custom
    {
        public Custom(SeedTrace.V2.V3.VoidFunctionDefinition value)
        {
            Value = value;
        }

        internal SeedTrace.V2.V3.VoidFunctionDefinition Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator TestCaseFunction.Custom(
            SeedTrace.V2.V3.VoidFunctionDefinition value
        ) => new(value);
    }
}
