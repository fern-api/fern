// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(JsonConverter))]
[Serializable]
public record SubmissionStatusForTestCase
{
    internal SubmissionStatusForTestCase(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of SubmissionStatusForTestCase with <see cref="Graded"/>.
    /// </summary>
    public SubmissionStatusForTestCase(Graded value)
    {
        Type = "graded";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of SubmissionStatusForTestCase with <see cref="GradedV2"/>.
    /// </summary>
    public SubmissionStatusForTestCase(GradedV2 value)
    {
        Type = "gradedV2";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of SubmissionStatusForTestCase with <see cref="Traced"/>.
    /// </summary>
    public SubmissionStatusForTestCase(Traced value)
    {
        Type = "traced";
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
    /// Returns true if <see cref="Type"/> is "graded"
    /// </summary>
    public bool IsGraded => Type == "graded";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "gradedV2"
    /// </summary>
    public bool IsGradedV2 => Type == "gradedV2";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "traced"
    /// </summary>
    public bool IsTraced => Type == "traced";

    /// <summary>
    /// Returns the value as a <see cref="TestCaseResultWithStdout"/> if <see cref="Type"/> is 'graded', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'graded'.</exception>
    public TestCaseResultWithStdout AsGraded() =>
        IsGraded
            ? (TestCaseResultWithStdout)Value!
            : throw new Exception("SeedTrace.SubmissionStatusForTestCase.Type is not 'graded'");

    /// <summary>
    /// Returns the value as a <see cref="TestCaseGrade"/> if <see cref="Type"/> is 'gradedV2', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'gradedV2'.</exception>
    public TestCaseGrade AsGradedV2() =>
        IsGradedV2
            ? (TestCaseGrade)Value!
            : throw new Exception("SeedTrace.SubmissionStatusForTestCase.Type is not 'gradedV2'");

    /// <summary>
    /// Returns the value as a <see cref="TracedTestCase"/> if <see cref="Type"/> is 'traced', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'traced'.</exception>
    public TracedTestCase AsTraced() =>
        IsTraced
            ? (TracedTestCase)Value!
            : throw new Exception("SeedTrace.SubmissionStatusForTestCase.Type is not 'traced'");

    public T Match<T>(
        Func<TestCaseResultWithStdout, T> onGraded,
        Func<TestCaseGrade, T> onGradedV2,
        Func<TracedTestCase, T> onTraced,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "graded" => onGraded(AsGraded()),
            "gradedV2" => onGradedV2(AsGradedV2()),
            "traced" => onTraced(AsTraced()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<TestCaseResultWithStdout> onGraded,
        Action<TestCaseGrade> onGradedV2,
        Action<TracedTestCase> onTraced,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "graded":
                onGraded(AsGraded());
                break;
            case "gradedV2":
                onGradedV2(AsGradedV2());
                break;
            case "traced":
                onTraced(AsTraced());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="TestCaseResultWithStdout"/> and returns true if successful.
    /// </summary>
    public bool TryAsGraded(out TestCaseResultWithStdout? value)
    {
        if (Type == "graded")
        {
            value = (TestCaseResultWithStdout)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="TestCaseGrade"/> and returns true if successful.
    /// </summary>
    public bool TryAsGradedV2(out TestCaseGrade? value)
    {
        if (Type == "gradedV2")
        {
            value = (TestCaseGrade)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="TracedTestCase"/> and returns true if successful.
    /// </summary>
    public bool TryAsTraced(out TracedTestCase? value)
    {
        if (Type == "traced")
        {
            value = (TracedTestCase)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator SubmissionStatusForTestCase(Graded value) => new(value);

    public static implicit operator SubmissionStatusForTestCase(GradedV2 value) => new(value);

    public static implicit operator SubmissionStatusForTestCase(Traced value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<SubmissionStatusForTestCase>
    {
        public override bool CanConvert(Type typeToConvert) =>
            typeof(SubmissionStatusForTestCase).IsAssignableFrom(typeToConvert);

        public override SubmissionStatusForTestCase Read(
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
                "graded" => json.Deserialize<TestCaseResultWithStdout>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.TestCaseResultWithStdout"
                    ),
                "gradedV2" => json.GetProperty("value").Deserialize<TestCaseGrade>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.TestCaseGrade"),
                "traced" => json.Deserialize<TracedTestCase>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.TracedTestCase"),
                _ => json.Deserialize<object?>(options),
            };
            return new SubmissionStatusForTestCase(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            SubmissionStatusForTestCase value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "graded" => JsonSerializer.SerializeToNode(value.Value, options),
                    "gradedV2" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "traced" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for graded
    /// </summary>
    [Serializable]
    public struct Graded
    {
        public Graded(TestCaseResultWithStdout value)
        {
            Value = value;
        }

        internal TestCaseResultWithStdout Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator Graded(TestCaseResultWithStdout value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for gradedV2
    /// </summary>
    [Serializable]
    public struct GradedV2
    {
        public GradedV2(TestCaseGrade value)
        {
            Value = value;
        }

        internal TestCaseGrade Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator GradedV2(TestCaseGrade value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for traced
    /// </summary>
    [Serializable]
    public struct Traced
    {
        public Traced(TracedTestCase value)
        {
            Value = value;
        }

        internal TracedTestCase Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator Traced(TracedTestCase value) => new(value);
    }
}
