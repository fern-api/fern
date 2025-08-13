// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(JsonConverter))]
[Serializable]
public record TestCaseGrade
{
    internal TestCaseGrade(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of TestCaseGrade with <see cref="Hidden"/>.
    /// </summary>
    public TestCaseGrade(Hidden value)
    {
        Type = "hidden";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of TestCaseGrade with <see cref="NonHidden"/>.
    /// </summary>
    public TestCaseGrade(NonHidden value)
    {
        Type = "nonHidden";
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
    /// Returns true if <see cref="Type"/> is "hidden"
    /// </summary>
    public bool IsHidden => Type == "hidden";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "nonHidden"
    /// </summary>
    public bool IsNonHidden => Type == "nonHidden";

    /// <summary>
    /// Returns the value as a <see cref="TestCaseHiddenGrade"/> if <see cref="Type"/> is 'hidden', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'hidden'.</exception>
    public TestCaseHiddenGrade AsHidden() =>
        IsHidden
            ? (TestCaseHiddenGrade)Value!
            : throw new Exception("SeedTrace.TestCaseGrade.Type is not 'hidden'");

    /// <summary>
    /// Returns the value as a <see cref="TestCaseNonHiddenGrade"/> if <see cref="Type"/> is 'nonHidden', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'nonHidden'.</exception>
    public TestCaseNonHiddenGrade AsNonHidden() =>
        IsNonHidden
            ? (TestCaseNonHiddenGrade)Value!
            : throw new Exception("SeedTrace.TestCaseGrade.Type is not 'nonHidden'");

    public T Match<T>(
        Func<TestCaseHiddenGrade, T> onHidden,
        Func<TestCaseNonHiddenGrade, T> onNonHidden,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "hidden" => onHidden(AsHidden()),
            "nonHidden" => onNonHidden(AsNonHidden()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<TestCaseHiddenGrade> onHidden,
        Action<TestCaseNonHiddenGrade> onNonHidden,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "hidden":
                onHidden(AsHidden());
                break;
            case "nonHidden":
                onNonHidden(AsNonHidden());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="TestCaseHiddenGrade"/> and returns true if successful.
    /// </summary>
    public bool TryAsHidden(out TestCaseHiddenGrade? value)
    {
        if (Type == "hidden")
        {
            value = (TestCaseHiddenGrade)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="TestCaseNonHiddenGrade"/> and returns true if successful.
    /// </summary>
    public bool TryAsNonHidden(out TestCaseNonHiddenGrade? value)
    {
        if (Type == "nonHidden")
        {
            value = (TestCaseNonHiddenGrade)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator TestCaseGrade(Hidden value) => new(value);

    public static implicit operator TestCaseGrade(NonHidden value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<TestCaseGrade>
    {
        public override bool CanConvert(Type typeToConvert) =>
            typeof(TestCaseGrade).IsAssignableFrom(typeToConvert);

        public override TestCaseGrade Read(
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
                "hidden" => json.Deserialize<TestCaseHiddenGrade>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.TestCaseHiddenGrade"
                    ),
                "nonHidden" => json.Deserialize<TestCaseNonHiddenGrade>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.TestCaseNonHiddenGrade"
                    ),
                _ => json.Deserialize<object?>(options),
            };
            return new TestCaseGrade(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            TestCaseGrade value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "hidden" => JsonSerializer.SerializeToNode(value.Value, options),
                    "nonHidden" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for hidden
    /// </summary>
    [Serializable]
    public struct Hidden
    {
        public Hidden(TestCaseHiddenGrade value)
        {
            Value = value;
        }

        internal TestCaseHiddenGrade Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator Hidden(TestCaseHiddenGrade value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for nonHidden
    /// </summary>
    [Serializable]
    public struct NonHidden
    {
        public NonHidden(TestCaseNonHiddenGrade value)
        {
            Value = value;
        }

        internal TestCaseNonHiddenGrade Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator NonHidden(TestCaseNonHiddenGrade value) => new(value);
    }
}
