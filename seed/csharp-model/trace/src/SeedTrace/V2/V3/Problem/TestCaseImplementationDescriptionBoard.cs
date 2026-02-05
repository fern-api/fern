// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2.V3;

[JsonConverter(typeof(TestCaseImplementationDescriptionBoard.JsonConverter))]
[Serializable]
public record TestCaseImplementationDescriptionBoard
{
    internal TestCaseImplementationDescriptionBoard(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of TestCaseImplementationDescriptionBoard with <see cref="TestCaseImplementationDescriptionBoard.Html"/>.
    /// </summary>
    public TestCaseImplementationDescriptionBoard(TestCaseImplementationDescriptionBoard.Html value)
    {
        Type = "html";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of TestCaseImplementationDescriptionBoard with <see cref="TestCaseImplementationDescriptionBoard.ParamId"/>.
    /// </summary>
    public TestCaseImplementationDescriptionBoard(
        TestCaseImplementationDescriptionBoard.ParamId value
    )
    {
        Type = "paramId";
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
    /// Returns true if <see cref="Type"/> is "html"
    /// </summary>
    public bool IsHtml => Type == "html";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "paramId"
    /// </summary>
    public bool IsParamId => Type == "paramId";

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'html', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'html'.</exception>
    public string AsHtml() =>
        IsHtml
            ? (string)Value!
            : throw new System.Exception(
                "TestCaseImplementationDescriptionBoard.Type is not 'html'"
            );

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'paramId', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'paramId'.</exception>
    public string AsParamId() =>
        IsParamId
            ? (string)Value!
            : throw new System.Exception(
                "TestCaseImplementationDescriptionBoard.Type is not 'paramId'"
            );

    public T Match<T>(
        Func<string, T> onHtml,
        Func<string, T> onParamId,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "html" => onHtml(AsHtml()),
            "paramId" => onParamId(AsParamId()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<string> onHtml,
        Action<string> onParamId,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "html":
                onHtml(AsHtml());
                break;
            case "paramId":
                onParamId(AsParamId());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryAsHtml(out string? value)
    {
        if (Type == "html")
        {
            value = (string)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryAsParamId(out string? value)
    {
        if (Type == "paramId")
        {
            value = (string)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator TestCaseImplementationDescriptionBoard(
        TestCaseImplementationDescriptionBoard.Html value
    ) => new(value);

    public static implicit operator TestCaseImplementationDescriptionBoard(
        TestCaseImplementationDescriptionBoard.ParamId value
    ) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<TestCaseImplementationDescriptionBoard>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(TestCaseImplementationDescriptionBoard).IsAssignableFrom(typeToConvert);

        public override TestCaseImplementationDescriptionBoard Read(
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
                "html" => json.GetProperty("value").Deserialize<string?>(options)
                ?? throw new JsonException("Failed to deserialize string"),
                "paramId" => json.GetProperty("value").Deserialize<string?>(options)
                ?? throw new JsonException("Failed to deserialize string"),
                _ => json.Deserialize<object?>(options),
            };
            return new TestCaseImplementationDescriptionBoard(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            TestCaseImplementationDescriptionBoard value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "html" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "paramId" => new JsonObject
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
    /// Discriminated union type for html
    /// </summary>
    [Serializable]
    public record Html
    {
        public Html(string value)
        {
            Value = value;
        }

        internal string Value { get; set; }

        public override string ToString() => Value;

        public static implicit operator TestCaseImplementationDescriptionBoard.Html(string value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for paramId
    /// </summary>
    [Serializable]
    public record ParamId
    {
        public ParamId(string value)
        {
            Value = value;
        }

        internal string Value { get; set; }

        public override string ToString() => Value;

        public static implicit operator TestCaseImplementationDescriptionBoard.ParamId(
            string value
        ) => new(value);
    }
}
