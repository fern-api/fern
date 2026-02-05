// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(ProblemDescriptionBoard.JsonConverter))]
[Serializable]
public record ProblemDescriptionBoard
{
    internal ProblemDescriptionBoard(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of ProblemDescriptionBoard with <see cref="ProblemDescriptionBoard.Html"/>.
    /// </summary>
    public ProblemDescriptionBoard(ProblemDescriptionBoard.Html value)
    {
        Type = "html";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of ProblemDescriptionBoard with <see cref="ProblemDescriptionBoard.Variable"/>.
    /// </summary>
    public ProblemDescriptionBoard(ProblemDescriptionBoard.Variable value)
    {
        Type = "variable";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of ProblemDescriptionBoard with <see cref="ProblemDescriptionBoard.TestCaseId"/>.
    /// </summary>
    public ProblemDescriptionBoard(ProblemDescriptionBoard.TestCaseId value)
    {
        Type = "testCaseId";
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
    /// Returns true if <see cref="Type"/> is "variable"
    /// </summary>
    public bool IsVariable => Type == "variable";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "testCaseId"
    /// </summary>
    public bool IsTestCaseId => Type == "testCaseId";

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'html', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'html'.</exception>
    public string AsHtml() =>
        IsHtml
            ? (string)Value!
            : throw new System.Exception("ProblemDescriptionBoard.Type is not 'html'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.VariableValue"/> if <see cref="Type"/> is 'variable', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'variable'.</exception>
    public SeedTrace.VariableValue AsVariable() =>
        IsVariable
            ? (SeedTrace.VariableValue)Value!
            : throw new System.Exception("ProblemDescriptionBoard.Type is not 'variable'");

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'testCaseId', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'testCaseId'.</exception>
    public string AsTestCaseId() =>
        IsTestCaseId
            ? (string)Value!
            : throw new System.Exception("ProblemDescriptionBoard.Type is not 'testCaseId'");

    public T Match<T>(
        Func<string, T> onHtml,
        Func<SeedTrace.VariableValue, T> onVariable,
        Func<string, T> onTestCaseId,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "html" => onHtml(AsHtml()),
            "variable" => onVariable(AsVariable()),
            "testCaseId" => onTestCaseId(AsTestCaseId()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<string> onHtml,
        Action<SeedTrace.VariableValue> onVariable,
        Action<string> onTestCaseId,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "html":
                onHtml(AsHtml());
                break;
            case "variable":
                onVariable(AsVariable());
                break;
            case "testCaseId":
                onTestCaseId(AsTestCaseId());
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
    /// Attempts to cast the value to a <see cref="SeedTrace.VariableValue"/> and returns true if successful.
    /// </summary>
    public bool TryAsVariable(out SeedTrace.VariableValue? value)
    {
        if (Type == "variable")
        {
            value = (SeedTrace.VariableValue)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryAsTestCaseId(out string? value)
    {
        if (Type == "testCaseId")
        {
            value = (string)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator ProblemDescriptionBoard(ProblemDescriptionBoard.Html value) =>
        new(value);

    public static implicit operator ProblemDescriptionBoard(
        ProblemDescriptionBoard.Variable value
    ) => new(value);

    public static implicit operator ProblemDescriptionBoard(
        ProblemDescriptionBoard.TestCaseId value
    ) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<ProblemDescriptionBoard>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(ProblemDescriptionBoard).IsAssignableFrom(typeToConvert);

        public override ProblemDescriptionBoard Read(
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
                "variable" => json.GetProperty("value")
                    .Deserialize<SeedTrace.VariableValue?>(options)
                ?? throw new JsonException("Failed to deserialize SeedTrace.VariableValue"),
                "testCaseId" => json.GetProperty("value").Deserialize<string?>(options)
                ?? throw new JsonException("Failed to deserialize string"),
                _ => json.Deserialize<object?>(options),
            };
            return new ProblemDescriptionBoard(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            ProblemDescriptionBoard value,
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
                    "variable" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "testCaseId" => new JsonObject
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

        public static implicit operator ProblemDescriptionBoard.Html(string value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for variable
    /// </summary>
    [Serializable]
    public struct Variable
    {
        public Variable(SeedTrace.VariableValue value)
        {
            Value = value;
        }

        internal SeedTrace.VariableValue Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator ProblemDescriptionBoard.Variable(
            SeedTrace.VariableValue value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for testCaseId
    /// </summary>
    [Serializable]
    public record TestCaseId
    {
        public TestCaseId(string value)
        {
            Value = value;
        }

        internal string Value { get; set; }

        public override string ToString() => Value;

        public static implicit operator ProblemDescriptionBoard.TestCaseId(string value) =>
            new(value);
    }
}
