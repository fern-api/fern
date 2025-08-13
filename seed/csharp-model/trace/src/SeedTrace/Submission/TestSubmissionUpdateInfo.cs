// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(JsonConverter))]
[Serializable]
public record TestSubmissionUpdateInfo
{
    internal TestSubmissionUpdateInfo(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of TestSubmissionUpdateInfo with <see cref="Running"/>.
    /// </summary>
    public TestSubmissionUpdateInfo(Running value)
    {
        Type = "running";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of TestSubmissionUpdateInfo with <see cref="Stopped"/>.
    /// </summary>
    public TestSubmissionUpdateInfo(Stopped value)
    {
        Type = "stopped";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of TestSubmissionUpdateInfo with <see cref="Errored"/>.
    /// </summary>
    public TestSubmissionUpdateInfo(Errored value)
    {
        Type = "errored";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of TestSubmissionUpdateInfo with <see cref="GradedTestCase"/>.
    /// </summary>
    public TestSubmissionUpdateInfo(GradedTestCase value)
    {
        Type = "gradedTestCase";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of TestSubmissionUpdateInfo with <see cref="RecordedTestCase"/>.
    /// </summary>
    public TestSubmissionUpdateInfo(RecordedTestCase value)
    {
        Type = "recordedTestCase";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of TestSubmissionUpdateInfo with <see cref="Finished"/>.
    /// </summary>
    public TestSubmissionUpdateInfo(Finished value)
    {
        Type = "finished";
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
    /// Returns true if <see cref="Type"/> is "running"
    /// </summary>
    public bool IsRunning => Type == "running";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "stopped"
    /// </summary>
    public bool IsStopped => Type == "stopped";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "errored"
    /// </summary>
    public bool IsErrored => Type == "errored";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "gradedTestCase"
    /// </summary>
    public bool IsGradedTestCase => Type == "gradedTestCase";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "recordedTestCase"
    /// </summary>
    public bool IsRecordedTestCase => Type == "recordedTestCase";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "finished"
    /// </summary>
    public bool IsFinished => Type == "finished";

    /// <summary>
    /// Returns the value as a <see cref="RunningSubmissionState"/> if <see cref="Type"/> is 'running', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'running'.</exception>
    public RunningSubmissionState AsRunning() =>
        IsRunning
            ? (RunningSubmissionState)Value!
            : throw new Exception("SeedTrace.TestSubmissionUpdateInfo.Type is not 'running'");

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'stopped', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'stopped'.</exception>
    public object AsStopped() =>
        IsStopped
            ? Value!
            : throw new Exception("SeedTrace.TestSubmissionUpdateInfo.Type is not 'stopped'");

    /// <summary>
    /// Returns the value as a <see cref="ErrorInfo"/> if <see cref="Type"/> is 'errored', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'errored'.</exception>
    public ErrorInfo AsErrored() =>
        IsErrored
            ? (ErrorInfo)Value!
            : throw new Exception("SeedTrace.TestSubmissionUpdateInfo.Type is not 'errored'");

    /// <summary>
    /// Returns the value as a <see cref="GradedTestCaseUpdate"/> if <see cref="Type"/> is 'gradedTestCase', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'gradedTestCase'.</exception>
    public GradedTestCaseUpdate AsGradedTestCase() =>
        IsGradedTestCase
            ? (GradedTestCaseUpdate)Value!
            : throw new Exception(
                "SeedTrace.TestSubmissionUpdateInfo.Type is not 'gradedTestCase'"
            );

    /// <summary>
    /// Returns the value as a <see cref="RecordedTestCaseUpdate"/> if <see cref="Type"/> is 'recordedTestCase', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'recordedTestCase'.</exception>
    public RecordedTestCaseUpdate AsRecordedTestCase() =>
        IsRecordedTestCase
            ? (RecordedTestCaseUpdate)Value!
            : throw new Exception(
                "SeedTrace.TestSubmissionUpdateInfo.Type is not 'recordedTestCase'"
            );

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'finished', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'finished'.</exception>
    public object AsFinished() =>
        IsFinished
            ? Value!
            : throw new Exception("SeedTrace.TestSubmissionUpdateInfo.Type is not 'finished'");

    public T Match<T>(
        Func<RunningSubmissionState, T> onRunning,
        Func<object, T> onStopped,
        Func<ErrorInfo, T> onErrored,
        Func<GradedTestCaseUpdate, T> onGradedTestCase,
        Func<RecordedTestCaseUpdate, T> onRecordedTestCase,
        Func<object, T> onFinished,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "running" => onRunning(AsRunning()),
            "stopped" => onStopped(AsStopped()),
            "errored" => onErrored(AsErrored()),
            "gradedTestCase" => onGradedTestCase(AsGradedTestCase()),
            "recordedTestCase" => onRecordedTestCase(AsRecordedTestCase()),
            "finished" => onFinished(AsFinished()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<RunningSubmissionState> onRunning,
        Action<object> onStopped,
        Action<ErrorInfo> onErrored,
        Action<GradedTestCaseUpdate> onGradedTestCase,
        Action<RecordedTestCaseUpdate> onRecordedTestCase,
        Action<object> onFinished,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "running":
                onRunning(AsRunning());
                break;
            case "stopped":
                onStopped(AsStopped());
                break;
            case "errored":
                onErrored(AsErrored());
                break;
            case "gradedTestCase":
                onGradedTestCase(AsGradedTestCase());
                break;
            case "recordedTestCase":
                onRecordedTestCase(AsRecordedTestCase());
                break;
            case "finished":
                onFinished(AsFinished());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="RunningSubmissionState"/> and returns true if successful.
    /// </summary>
    public bool TryAsRunning(out RunningSubmissionState? value)
    {
        if (Type == "running")
        {
            value = (RunningSubmissionState)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="object"/> and returns true if successful.
    /// </summary>
    public bool TryAsStopped(out object? value)
    {
        if (Type == "stopped")
        {
            value = Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="ErrorInfo"/> and returns true if successful.
    /// </summary>
    public bool TryAsErrored(out ErrorInfo? value)
    {
        if (Type == "errored")
        {
            value = (ErrorInfo)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="GradedTestCaseUpdate"/> and returns true if successful.
    /// </summary>
    public bool TryAsGradedTestCase(out GradedTestCaseUpdate? value)
    {
        if (Type == "gradedTestCase")
        {
            value = (GradedTestCaseUpdate)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="RecordedTestCaseUpdate"/> and returns true if successful.
    /// </summary>
    public bool TryAsRecordedTestCase(out RecordedTestCaseUpdate? value)
    {
        if (Type == "recordedTestCase")
        {
            value = (RecordedTestCaseUpdate)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="object"/> and returns true if successful.
    /// </summary>
    public bool TryAsFinished(out object? value)
    {
        if (Type == "finished")
        {
            value = Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator TestSubmissionUpdateInfo(Running value) => new(value);

    public static implicit operator TestSubmissionUpdateInfo(Errored value) => new(value);

    public static implicit operator TestSubmissionUpdateInfo(GradedTestCase value) => new(value);

    public static implicit operator TestSubmissionUpdateInfo(RecordedTestCase value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<TestSubmissionUpdateInfo>
    {
        public override bool CanConvert(Type typeToConvert) =>
            typeof(TestSubmissionUpdateInfo).IsAssignableFrom(typeToConvert);

        public override TestSubmissionUpdateInfo Read(
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
                "running" => json.GetProperty("value").Deserialize<RunningSubmissionState>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.RunningSubmissionState"
                    ),
                "stopped" => new { },
                "errored" => json.GetProperty("value").Deserialize<ErrorInfo>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.ErrorInfo"),
                "gradedTestCase" => json.Deserialize<GradedTestCaseUpdate>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.GradedTestCaseUpdate"
                    ),
                "recordedTestCase" => json.Deserialize<RecordedTestCaseUpdate>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.RecordedTestCaseUpdate"
                    ),
                "finished" => new { },
                _ => json.Deserialize<object?>(options),
            };
            return new TestSubmissionUpdateInfo(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            TestSubmissionUpdateInfo value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "running" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "stopped" => null,
                    "errored" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "gradedTestCase" => JsonSerializer.SerializeToNode(value.Value, options),
                    "recordedTestCase" => JsonSerializer.SerializeToNode(value.Value, options),
                    "finished" => null,
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for running
    /// </summary>
    [Serializable]
    public struct Running
    {
        public Running(RunningSubmissionState value)
        {
            Value = value;
        }

        internal RunningSubmissionState Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator Running(RunningSubmissionState value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for stopped
    /// </summary>
    [Serializable]
    public record Stopped
    {
        internal object Value => new { };

        public override string ToString() => Value.ToString();
    }

    /// <summary>
    /// Discriminated union type for errored
    /// </summary>
    [Serializable]
    public struct Errored
    {
        public Errored(ErrorInfo value)
        {
            Value = value;
        }

        internal ErrorInfo Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator Errored(ErrorInfo value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for gradedTestCase
    /// </summary>
    [Serializable]
    public struct GradedTestCase
    {
        public GradedTestCase(GradedTestCaseUpdate value)
        {
            Value = value;
        }

        internal GradedTestCaseUpdate Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator GradedTestCase(GradedTestCaseUpdate value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for recordedTestCase
    /// </summary>
    [Serializable]
    public struct RecordedTestCase
    {
        public RecordedTestCase(RecordedTestCaseUpdate value)
        {
            Value = value;
        }

        internal RecordedTestCaseUpdate Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator RecordedTestCase(RecordedTestCaseUpdate value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for finished
    /// </summary>
    [Serializable]
    public record Finished
    {
        internal object Value => new { };

        public override string ToString() => Value.ToString();
    }
}
