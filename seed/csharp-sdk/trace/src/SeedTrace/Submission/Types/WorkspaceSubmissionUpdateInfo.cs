// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(WorkspaceSubmissionUpdateInfo.JsonConverter))]
[Serializable]
public record WorkspaceSubmissionUpdateInfo
{
    internal WorkspaceSubmissionUpdateInfo(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of WorkspaceSubmissionUpdateInfo with <see cref="WorkspaceSubmissionUpdateInfo.Running"/>.
    /// </summary>
    public WorkspaceSubmissionUpdateInfo(WorkspaceSubmissionUpdateInfo.Running value)
    {
        Type = "running";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of WorkspaceSubmissionUpdateInfo with <see cref="WorkspaceSubmissionUpdateInfo.Ran"/>.
    /// </summary>
    public WorkspaceSubmissionUpdateInfo(WorkspaceSubmissionUpdateInfo.Ran value)
    {
        Type = "ran";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of WorkspaceSubmissionUpdateInfo with <see cref="WorkspaceSubmissionUpdateInfo.Stopped"/>.
    /// </summary>
    public WorkspaceSubmissionUpdateInfo(WorkspaceSubmissionUpdateInfo.Stopped value)
    {
        Type = "stopped";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of WorkspaceSubmissionUpdateInfo with <see cref="WorkspaceSubmissionUpdateInfo.Traced"/>.
    /// </summary>
    public WorkspaceSubmissionUpdateInfo(WorkspaceSubmissionUpdateInfo.Traced value)
    {
        Type = "traced";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of WorkspaceSubmissionUpdateInfo with <see cref="WorkspaceSubmissionUpdateInfo.TracedV2"/>.
    /// </summary>
    public WorkspaceSubmissionUpdateInfo(WorkspaceSubmissionUpdateInfo.TracedV2 value)
    {
        Type = "tracedV2";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of WorkspaceSubmissionUpdateInfo with <see cref="WorkspaceSubmissionUpdateInfo.Errored"/>.
    /// </summary>
    public WorkspaceSubmissionUpdateInfo(WorkspaceSubmissionUpdateInfo.Errored value)
    {
        Type = "errored";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of WorkspaceSubmissionUpdateInfo with <see cref="WorkspaceSubmissionUpdateInfo.Finished"/>.
    /// </summary>
    public WorkspaceSubmissionUpdateInfo(WorkspaceSubmissionUpdateInfo.Finished value)
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
    /// Returns the value as a <see cref="SeedTrace.RunningSubmissionState"/> if <see cref="Type"/> is 'running', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'running'.</exception>
    public SeedTrace.RunningSubmissionState AsRunning() =>
        IsRunning
            ? (SeedTrace.RunningSubmissionState)Value!
            : throw new System.Exception("WorkspaceSubmissionUpdateInfo.Type is not 'running'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.WorkspaceRunDetails"/> if <see cref="Type"/> is 'ran', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'ran'.</exception>
    public SeedTrace.WorkspaceRunDetails AsRan() =>
        IsRan
            ? (SeedTrace.WorkspaceRunDetails)Value!
            : throw new System.Exception("WorkspaceSubmissionUpdateInfo.Type is not 'ran'");

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'stopped', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'stopped'.</exception>
    public object AsStopped() =>
        IsStopped
            ? Value!
            : throw new System.Exception("WorkspaceSubmissionUpdateInfo.Type is not 'stopped'");

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'traced', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'traced'.</exception>
    public object AsTraced() =>
        IsTraced
            ? Value!
            : throw new System.Exception("WorkspaceSubmissionUpdateInfo.Type is not 'traced'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.WorkspaceTracedUpdate"/> if <see cref="Type"/> is 'tracedV2', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'tracedV2'.</exception>
    public SeedTrace.WorkspaceTracedUpdate AsTracedV2() =>
        IsTracedV2
            ? (SeedTrace.WorkspaceTracedUpdate)Value!
            : throw new System.Exception("WorkspaceSubmissionUpdateInfo.Type is not 'tracedV2'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.ErrorInfo"/> if <see cref="Type"/> is 'errored', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'errored'.</exception>
    public SeedTrace.ErrorInfo AsErrored() =>
        IsErrored
            ? (SeedTrace.ErrorInfo)Value!
            : throw new System.Exception("WorkspaceSubmissionUpdateInfo.Type is not 'errored'");

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'finished', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'finished'.</exception>
    public object AsFinished() =>
        IsFinished
            ? Value!
            : throw new System.Exception("WorkspaceSubmissionUpdateInfo.Type is not 'finished'");

    public T Match<T>(
        Func<SeedTrace.RunningSubmissionState, T> onRunning,
        Func<SeedTrace.WorkspaceRunDetails, T> onRan,
        Func<object, T> onStopped,
        Func<object, T> onTraced,
        Func<SeedTrace.WorkspaceTracedUpdate, T> onTracedV2,
        Func<SeedTrace.ErrorInfo, T> onErrored,
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
        Action<SeedTrace.RunningSubmissionState> onRunning,
        Action<SeedTrace.WorkspaceRunDetails> onRan,
        Action<object> onStopped,
        Action<object> onTraced,
        Action<SeedTrace.WorkspaceTracedUpdate> onTracedV2,
        Action<SeedTrace.ErrorInfo> onErrored,
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
    /// Attempts to cast the value to a <see cref="SeedTrace.WorkspaceRunDetails"/> and returns true if successful.
    /// </summary>
    public bool TryAsRan(out SeedTrace.WorkspaceRunDetails? value)
    {
        if (Type == "ran")
        {
            value = (SeedTrace.WorkspaceRunDetails)Value!;
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
    /// Attempts to cast the value to a <see cref="SeedTrace.WorkspaceTracedUpdate"/> and returns true if successful.
    /// </summary>
    public bool TryAsTracedV2(out SeedTrace.WorkspaceTracedUpdate? value)
    {
        if (Type == "tracedV2")
        {
            value = (SeedTrace.WorkspaceTracedUpdate)Value!;
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

    public static implicit operator WorkspaceSubmissionUpdateInfo(
        WorkspaceSubmissionUpdateInfo.Running value
    ) => new(value);

    public static implicit operator WorkspaceSubmissionUpdateInfo(
        WorkspaceSubmissionUpdateInfo.Ran value
    ) => new(value);

    public static implicit operator WorkspaceSubmissionUpdateInfo(
        WorkspaceSubmissionUpdateInfo.TracedV2 value
    ) => new(value);

    public static implicit operator WorkspaceSubmissionUpdateInfo(
        WorkspaceSubmissionUpdateInfo.Errored value
    ) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<WorkspaceSubmissionUpdateInfo>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(WorkspaceSubmissionUpdateInfo).IsAssignableFrom(typeToConvert);

        public override WorkspaceSubmissionUpdateInfo Read(
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
                "running" => json.GetProperty("value")
                    .Deserialize<SeedTrace.RunningSubmissionState?>(options)
                ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.RunningSubmissionState"
                    ),
                "ran" => json.Deserialize<SeedTrace.WorkspaceRunDetails?>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.WorkspaceRunDetails"
                    ),
                "stopped" => new { },
                "traced" => new { },
                "tracedV2" => json.Deserialize<SeedTrace.WorkspaceTracedUpdate?>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.WorkspaceTracedUpdate"
                    ),
                "errored" => json.GetProperty("value").Deserialize<SeedTrace.ErrorInfo?>(options)
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
        public Running(SeedTrace.RunningSubmissionState value)
        {
            Value = value;
        }

        internal SeedTrace.RunningSubmissionState Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator WorkspaceSubmissionUpdateInfo.Running(
            SeedTrace.RunningSubmissionState value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for ran
    /// </summary>
    [Serializable]
    public struct Ran
    {
        public Ran(SeedTrace.WorkspaceRunDetails value)
        {
            Value = value;
        }

        internal SeedTrace.WorkspaceRunDetails Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator WorkspaceSubmissionUpdateInfo.Ran(
            SeedTrace.WorkspaceRunDetails value
        ) => new(value);
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
    /// Discriminated union type for traced
    /// </summary>
    [Serializable]
    public record Traced
    {
        internal object Value => new { };

        public override string ToString() => Value.ToString() ?? "null";
    }

    /// <summary>
    /// Discriminated union type for tracedV2
    /// </summary>
    [Serializable]
    public struct TracedV2
    {
        public TracedV2(SeedTrace.WorkspaceTracedUpdate value)
        {
            Value = value;
        }

        internal SeedTrace.WorkspaceTracedUpdate Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator WorkspaceSubmissionUpdateInfo.TracedV2(
            SeedTrace.WorkspaceTracedUpdate value
        ) => new(value);
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

        public static implicit operator WorkspaceSubmissionUpdateInfo.Errored(
            SeedTrace.ErrorInfo value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for finished
    /// </summary>
    [Serializable]
    public record Finished
    {
        internal object Value => new { };

        public override string ToString() => Value.ToString() ?? "null";
    }
}
