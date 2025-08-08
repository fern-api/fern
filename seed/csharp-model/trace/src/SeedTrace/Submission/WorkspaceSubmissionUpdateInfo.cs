// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(JsonConverter))]
[Serializable]
public record WorkspaceSubmissionUpdateInfo
{
    internal WorkspaceSubmissionUpdateInfo(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of WorkspaceSubmissionUpdateInfo with <see cref="Running"/>.
    /// </summary>
    public WorkspaceSubmissionUpdateInfo(Running value)
    {
        Type = "running";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of WorkspaceSubmissionUpdateInfo with <see cref="Ran"/>.
    /// </summary>
    public WorkspaceSubmissionUpdateInfo(Ran value)
    {
        Type = "ran";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of WorkspaceSubmissionUpdateInfo with <see cref="Stopped"/>.
    /// </summary>
    public WorkspaceSubmissionUpdateInfo(Stopped value)
    {
        Type = "stopped";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of WorkspaceSubmissionUpdateInfo with <see cref="Traced"/>.
    /// </summary>
    public WorkspaceSubmissionUpdateInfo(Traced value)
    {
        Type = "traced";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of WorkspaceSubmissionUpdateInfo with <see cref="TracedV2"/>.
    /// </summary>
    public WorkspaceSubmissionUpdateInfo(TracedV2 value)
    {
        Type = "tracedV2";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of WorkspaceSubmissionUpdateInfo with <see cref="Errored"/>.
    /// </summary>
    public WorkspaceSubmissionUpdateInfo(Errored value)
    {
        Type = "errored";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of WorkspaceSubmissionUpdateInfo with <see cref="Finished"/>.
    /// </summary>
    public WorkspaceSubmissionUpdateInfo(Finished value)
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
    /// Returns true if <see cref="Type"/> is "ran"
    /// </summary>
    public bool IsRan => Type == "ran";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "stopped"
    /// </summary>
    public bool IsStopped => Type == "stopped";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "traced"
    /// </summary>
    public bool IsTraced => Type == "traced";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "tracedV2"
    /// </summary>
    public bool IsTracedV2 => Type == "tracedV2";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "errored"
    /// </summary>
    public bool IsErrored => Type == "errored";

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
            : throw new Exception("SeedTrace.WorkspaceSubmissionUpdateInfo.Type is not 'running'");

    /// <summary>
    /// Returns the value as a <see cref="WorkspaceRunDetails"/> if <see cref="Type"/> is 'ran', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'ran'.</exception>
    public WorkspaceRunDetails AsRan() =>
        IsRan
            ? (WorkspaceRunDetails)Value!
            : throw new Exception("SeedTrace.WorkspaceSubmissionUpdateInfo.Type is not 'ran'");

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'stopped', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'stopped'.</exception>
    public object AsStopped() =>
        IsStopped
            ? Value!
            : throw new Exception("SeedTrace.WorkspaceSubmissionUpdateInfo.Type is not 'stopped'");

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'traced', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'traced'.</exception>
    public object AsTraced() =>
        IsTraced
            ? Value!
            : throw new Exception("SeedTrace.WorkspaceSubmissionUpdateInfo.Type is not 'traced'");

    /// <summary>
    /// Returns the value as a <see cref="WorkspaceTracedUpdate"/> if <see cref="Type"/> is 'tracedV2', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'tracedV2'.</exception>
    public WorkspaceTracedUpdate AsTracedV2() =>
        IsTracedV2
            ? (WorkspaceTracedUpdate)Value!
            : throw new Exception("SeedTrace.WorkspaceSubmissionUpdateInfo.Type is not 'tracedV2'");

    /// <summary>
    /// Returns the value as a <see cref="ErrorInfo"/> if <see cref="Type"/> is 'errored', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'errored'.</exception>
    public ErrorInfo AsErrored() =>
        IsErrored
            ? (ErrorInfo)Value!
            : throw new Exception("SeedTrace.WorkspaceSubmissionUpdateInfo.Type is not 'errored'");

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'finished', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'finished'.</exception>
    public object AsFinished() =>
        IsFinished
            ? Value!
            : throw new Exception("SeedTrace.WorkspaceSubmissionUpdateInfo.Type is not 'finished'");

    public T Match<T>(
        Func<RunningSubmissionState, T> onRunning,
        Func<WorkspaceRunDetails, T> onRan,
        Func<object, T> onStopped,
        Func<object, T> onTraced,
        Func<WorkspaceTracedUpdate, T> onTracedV2,
        Func<ErrorInfo, T> onErrored,
        Func<object, T> onFinished,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "running" => onRunning(AsRunning()),
            "ran" => onRan(AsRan()),
            "stopped" => onStopped(AsStopped()),
            "traced" => onTraced(AsTraced()),
            "tracedV2" => onTracedV2(AsTracedV2()),
            "errored" => onErrored(AsErrored()),
            "finished" => onFinished(AsFinished()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<RunningSubmissionState> onRunning,
        Action<WorkspaceRunDetails> onRan,
        Action<object> onStopped,
        Action<object> onTraced,
        Action<WorkspaceTracedUpdate> onTracedV2,
        Action<ErrorInfo> onErrored,
        Action<object> onFinished,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "running":
                onRunning(AsRunning());
                break;
            case "ran":
                onRan(AsRan());
                break;
            case "stopped":
                onStopped(AsStopped());
                break;
            case "traced":
                onTraced(AsTraced());
                break;
            case "tracedV2":
                onTracedV2(AsTracedV2());
                break;
            case "errored":
                onErrored(AsErrored());
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
    /// Attempts to cast the value to a <see cref="WorkspaceRunDetails"/> and returns true if successful.
    /// </summary>
    public bool TryAsRan(out WorkspaceRunDetails? value)
    {
        if (Type == "ran")
        {
            value = (WorkspaceRunDetails)Value!;
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
    /// Attempts to cast the value to a <see cref="object"/> and returns true if successful.
    /// </summary>
    public bool TryAsTraced(out object? value)
    {
        if (Type == "traced")
        {
            value = Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="WorkspaceTracedUpdate"/> and returns true if successful.
    /// </summary>
    public bool TryAsTracedV2(out WorkspaceTracedUpdate? value)
    {
        if (Type == "tracedV2")
        {
            value = (WorkspaceTracedUpdate)Value!;
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

    public static implicit operator WorkspaceSubmissionUpdateInfo(Running value) => new(value);

    public static implicit operator WorkspaceSubmissionUpdateInfo(Ran value) => new(value);

    public static implicit operator WorkspaceSubmissionUpdateInfo(TracedV2 value) => new(value);

    public static implicit operator WorkspaceSubmissionUpdateInfo(Errored value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<WorkspaceSubmissionUpdateInfo>
    {
        public override bool CanConvert(Type typeToConvert) =>
            typeof(WorkspaceSubmissionUpdateInfo).IsAssignableFrom(typeToConvert);

        public override WorkspaceSubmissionUpdateInfo Read(
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
                "ran" => json.Deserialize<WorkspaceRunDetails>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.WorkspaceRunDetails"
                    ),
                "stopped" => new { },
                "traced" => new { },
                "tracedV2" => json.Deserialize<WorkspaceTracedUpdate>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.WorkspaceTracedUpdate"
                    ),
                "errored" => json.GetProperty("value").Deserialize<ErrorInfo>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.ErrorInfo"),
                "finished" => new { },
                _ => json.Deserialize<object?>(options),
            };
            return new WorkspaceSubmissionUpdateInfo(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            WorkspaceSubmissionUpdateInfo value,
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
                    "ran" => JsonSerializer.SerializeToNode(value.Value, options),
                    "stopped" => null,
                    "traced" => null,
                    "tracedV2" => JsonSerializer.SerializeToNode(value.Value, options),
                    "errored" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
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
    /// Discriminated union type for ran
    /// </summary>
    [Serializable]
    public struct Ran
    {
        public Ran(WorkspaceRunDetails value)
        {
            Value = value;
        }

        internal WorkspaceRunDetails Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator Ran(WorkspaceRunDetails value) => new(value);
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
    /// Discriminated union type for traced
    /// </summary>
    [Serializable]
    public record Traced
    {
        internal object Value => new { };

        public override string ToString() => Value.ToString();
    }

    /// <summary>
    /// Discriminated union type for tracedV2
    /// </summary>
    [Serializable]
    public struct TracedV2
    {
        public TracedV2(WorkspaceTracedUpdate value)
        {
            Value = value;
        }

        internal WorkspaceTracedUpdate Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator TracedV2(WorkspaceTracedUpdate value) => new(value);
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
    /// Discriminated union type for finished
    /// </summary>
    [Serializable]
    public record Finished
    {
        internal object Value => new { };

        public override string ToString() => Value.ToString();
    }
}
