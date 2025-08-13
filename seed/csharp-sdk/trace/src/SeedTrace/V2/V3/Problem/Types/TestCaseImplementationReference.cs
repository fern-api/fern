// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2.V3;

[JsonConverter(typeof(JsonConverter))]
[Serializable]
public record TestCaseImplementationReference
{
    internal TestCaseImplementationReference(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of TestCaseImplementationReference with <see cref="TemplateId"/>.
    /// </summary>
    public TestCaseImplementationReference(TemplateId value)
    {
        Type = "templateId";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of TestCaseImplementationReference with <see cref="Implementation"/>.
    /// </summary>
    public TestCaseImplementationReference(Implementation value)
    {
        Type = "implementation";
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
    /// Returns true if <see cref="Type"/> is "templateId"
    /// </summary>
    public bool IsTemplateId => Type == "templateId";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "implementation"
    /// </summary>
    public bool IsImplementation => Type == "implementation";

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'templateId', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'templateId'.</exception>
    public string AsTemplateId() =>
        IsTemplateId
            ? (string)Value!
            : throw new Exception(
                "SeedTrace.V2.V3.TestCaseImplementationReference.Type is not 'templateId'"
            );

    /// <summary>
    /// Returns the value as a <see cref="TestCaseImplementation"/> if <see cref="Type"/> is 'implementation', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'implementation'.</exception>
    public TestCaseImplementation AsImplementation() =>
        IsImplementation
            ? (TestCaseImplementation)Value!
            : throw new Exception(
                "SeedTrace.V2.V3.TestCaseImplementationReference.Type is not 'implementation'"
            );

    public T Match<T>(
        Func<string, T> onTemplateId,
        Func<TestCaseImplementation, T> onImplementation,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "templateId" => onTemplateId(AsTemplateId()),
            "implementation" => onImplementation(AsImplementation()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<string> onTemplateId,
        Action<TestCaseImplementation> onImplementation,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "templateId":
                onTemplateId(AsTemplateId());
                break;
            case "implementation":
                onImplementation(AsImplementation());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryAsTemplateId(out string? value)
    {
        if (Type == "templateId")
        {
            value = (string)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="TestCaseImplementation"/> and returns true if successful.
    /// </summary>
    public bool TryAsImplementation(out TestCaseImplementation? value)
    {
        if (Type == "implementation")
        {
            value = (TestCaseImplementation)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator TestCaseImplementationReference(TemplateId value) => new(value);

    public static implicit operator TestCaseImplementationReference(Implementation value) =>
        new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<TestCaseImplementationReference>
    {
        public override bool CanConvert(Type typeToConvert) =>
            typeof(TestCaseImplementationReference).IsAssignableFrom(typeToConvert);

        public override TestCaseImplementationReference Read(
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
                "templateId" => json.GetProperty("value").Deserialize<string>(options)
                    ?? throw new JsonException("Failed to deserialize string"),
                "implementation" => json.Deserialize<TestCaseImplementation>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.V2.V3.TestCaseImplementation"
                    ),
                _ => json.Deserialize<object?>(options),
            };
            return new TestCaseImplementationReference(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            TestCaseImplementationReference value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "templateId" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "implementation" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for templateId
    /// </summary>
    [Serializable]
    public record TemplateId
    {
        public TemplateId(string value)
        {
            Value = value;
        }

        internal string Value { get; set; }

        public override string ToString() => Value;

        public static implicit operator TemplateId(string value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for implementation
    /// </summary>
    [Serializable]
    public struct Implementation
    {
        public Implementation(TestCaseImplementation value)
        {
            Value = value;
        }

        internal TestCaseImplementation Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator Implementation(TestCaseImplementation value) => new(value);
    }
}
