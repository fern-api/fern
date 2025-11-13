// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(TestSubmissionStatus.JsonConverter))]
[Serializable]
public record TestSubmissionStatus
{
    internal TestSubmissionStatus(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of TestSubmissionStatus with <see cref="TestSubmissionStatus.Stopped"/>.
    /// </summary>
    public TestSubmissionStatus(TestSubmissionStatus.Stopped value)
    {
        Type = "stopped";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of TestSubmissionStatus with <see cref="TestSubmissionStatus.Errored"/>.
    /// </summary>
    public TestSubmissionStatus(TestSubmissionStatus.Errored value)
    {
        Type = "errored";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of TestSubmissionStatus with <see cref="TestSubmissionStatus.Running"/>.
    /// </summary>
    public TestSubmissionStatus(TestSubmissionStatus.Running value)
    {
        Type = "running";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of TestSubmissionStatus with <see cref="TestSubmissionStatus.TestCaseIdToState"/>.
    /// </summary>
    public TestSubmissionStatus(TestSubmissionStatus.TestCaseIdToState value)
    {
        Type = "testCaseIdToState";
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
    /// Returns true if <see cref="Type"/> is "stopped"
    /// </summary>
    public bool IsStopped => Type == "stopped";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "errored"
    /// </summary>
    public bool IsErrored => Type == "errored";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "running"
    /// </summary>
    public bool IsRunning => Type == "running";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "testCaseIdToState"
    /// </summary>
    public bool IsTestCaseIdToState => Type == "testCaseIdToState";

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'stopped', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'stopped'.</exception>
    public object AsStopped() =>
        IsStopped
            ? Value!
            : throw new System.Exception("TestSubmissionStatus.Type is not 'stopped'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.ErrorInfo"/> if <see cref="Type"/> is 'errored', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'errored'.</exception>
    public SeedTrace.ErrorInfo AsErrored() =>
        IsErrored
            ? (SeedTrace.ErrorInfo)Value!
            : throw new System.Exception("TestSubmissionStatus.Type is not 'errored'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.RunningSubmissionState"/> if <see cref="Type"/> is 'running', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'running'.</exception>
    public SeedTrace.RunningSubmissionState AsRunning() =>
        IsRunning
            ? (SeedTrace.RunningSubmissionState)Value!
            : throw new System.Exception("TestSubmissionStatus.Type is not 'running'");

    /// <summary>
    /// Returns the value as a <see cref="Dictionary<string, SubmissionStatusForTestCase>"/> if <see cref="Type"/> is 'testCaseIdToState', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'testCaseIdToState'.</exception>
    public Dictionary<string, SubmissionStatusForTestCase> AsTestCaseIdToState() =>
        IsTestCaseIdToState
            ? (Dictionary<string, SubmissionStatusForTestCase>)Value!
            : throw new System.Exception("TestSubmissionStatus.Type is not 'testCaseIdToState'");

    public T Match<T>(
        Func<object, T> onStopped,
        Func<SeedTrace.ErrorInfo, T> onErrored,
        Func<SeedTrace.RunningSubmissionState, T> onRunning,
        Func<Dictionary<string, SubmissionStatusForTestCase>, T> onTestCaseIdToState,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "stopped" => onStopped(AsStopped()),
            "errored" => onErrored(AsErrored()),
            "running" => onRunning(AsRunning()),
            "testCaseIdToState" => onTestCaseIdToState(AsTestCaseIdToState()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<object> onStopped,
        Action<SeedTrace.ErrorInfo> onErrored,
        Action<SeedTrace.RunningSubmissionState> onRunning,
        Action<Dictionary<string, SubmissionStatusForTestCase>> onTestCaseIdToState,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "stopped":
                onStopped(AsStopped());
                break;
            case "errored":
                onErrored(AsErrored());
                break;
            case "running":
                onRunning(AsRunning());
                break;
            case "testCaseIdToState":
                onTestCaseIdToState(AsTestCaseIdToState());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
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
    /// Attempts to cast the value to a <see cref="SeedTrace.ErrorInfo"/> and returns true if successful.
    /// </summary>
    public bool TryAsErrored(out SeedTrace.ErrorInfo? value)
    {
        if (Type == "errored")
        {
            value = (SeedTrace.ErrorInfo)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.RunningSubmissionState"/> and returns true if successful.
    /// </summary>
    public bool TryAsRunning(out SeedTrace.RunningSubmissionState? value)
    {
        if (Type == "running")
        {
            value = (SeedTrace.RunningSubmissionState)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="Dictionary<string, SubmissionStatusForTestCase>"/> and returns true if successful.
    /// </summary>
    public bool TryAsTestCaseIdToState(out Dictionary<string, SubmissionStatusForTestCase>? value)
    {
        if (Type == "testCaseIdToState")
        {
            value = (Dictionary<string, SubmissionStatusForTestCase>)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator TestSubmissionStatus(TestSubmissionStatus.Errored value) =>
        new(value);

    public static implicit operator TestSubmissionStatus(TestSubmissionStatus.Running value) =>
        new(value);

    public static implicit operator TestSubmissionStatus(
        TestSubmissionStatus.TestCaseIdToState value
    ) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<TestSubmissionStatus>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(TestSubmissionStatus).IsAssignableFrom(typeToConvert);

        public override TestSubmissionStatus Read(
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
                "stopped" => new { },
                "errored" => json.GetProperty("value").Deserialize<SeedTrace.ErrorInfo?>(options)
                ?? throw new JsonException("Failed to deserialize SeedTrace.ErrorInfo"),
                "running" => json.GetProperty("value")
                    .Deserialize<SeedTrace.RunningSubmissionState?>(options)
                ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.RunningSubmissionState"
                    ),
                "testCaseIdToState" => json.GetProperty("value")
                    .Deserialize<Dictionary<string, SubmissionStatusForTestCase>?>(options)
                ?? throw new JsonException(
                        "Failed to deserialize Dictionary<string, SubmissionStatusForTestCase>"
                    ),
                _ => json.Deserialize<object?>(options),
            };
            return new TestSubmissionStatus(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            TestSubmissionStatus value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "stopped" => null,
                    "errored" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "running" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "testCaseIdToState" => new JsonObject
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
    /// Discriminated union type for stopped
    /// </summary>
    [Serializable]
    public record Stopped
    {
        internal object Value => new { };

        public override string ToString() => Value.ToString() ?? "null";
    }

    /// <summary>
    /// Discriminated union type for errored
    /// </summary>
    [Serializable]
    public struct Errored
    {
        public Errored(SeedTrace.ErrorInfo value)
        {
            Value = value;
        }

        internal SeedTrace.ErrorInfo Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator TestSubmissionStatus.Errored(SeedTrace.ErrorInfo value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for running
    /// </summary>
    [Serializable]
    public struct Running
    {
        public Running(SeedTrace.RunningSubmissionState value)
        {
            Value = value;
        }

        internal SeedTrace.RunningSubmissionState Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator TestSubmissionStatus.Running(
            SeedTrace.RunningSubmissionState value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for testCaseIdToState
    /// </summary>
    [Serializable]
    public record TestCaseIdToState
    {
        public TestCaseIdToState(Dictionary<string, SubmissionStatusForTestCase> value)
        {
            Value = value;
        }

        internal Dictionary<string, SubmissionStatusForTestCase> Value { get; set; } =
            new Dictionary<string, SubmissionStatusForTestCase>();

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator TestSubmissionStatus.TestCaseIdToState(
            Dictionary<string, SubmissionStatusForTestCase> value
        ) => new(value);
    }
}
