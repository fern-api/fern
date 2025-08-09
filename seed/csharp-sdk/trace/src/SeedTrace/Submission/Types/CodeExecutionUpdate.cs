// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(JsonConverter))]
[Serializable]
public record CodeExecutionUpdate
{
    internal CodeExecutionUpdate(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of CodeExecutionUpdate with <see cref="BuildingExecutor"/>.
    /// </summary>
    public CodeExecutionUpdate(BuildingExecutor value)
    {
        Type = "buildingExecutor";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of CodeExecutionUpdate with <see cref="Running"/>.
    /// </summary>
    public CodeExecutionUpdate(Running value)
    {
        Type = "running";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of CodeExecutionUpdate with <see cref="Errored"/>.
    /// </summary>
    public CodeExecutionUpdate(Errored value)
    {
        Type = "errored";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of CodeExecutionUpdate with <see cref="Stopped"/>.
    /// </summary>
    public CodeExecutionUpdate(Stopped value)
    {
        Type = "stopped";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of CodeExecutionUpdate with <see cref="Graded"/>.
    /// </summary>
    public CodeExecutionUpdate(Graded value)
    {
        Type = "graded";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of CodeExecutionUpdate with <see cref="GradedV2"/>.
    /// </summary>
    public CodeExecutionUpdate(GradedV2 value)
    {
        Type = "gradedV2";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of CodeExecutionUpdate with <see cref="WorkspaceRan"/>.
    /// </summary>
    public CodeExecutionUpdate(WorkspaceRan value)
    {
        Type = "workspaceRan";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of CodeExecutionUpdate with <see cref="Recording"/>.
    /// </summary>
    public CodeExecutionUpdate(Recording value)
    {
        Type = "recording";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of CodeExecutionUpdate with <see cref="Recorded"/>.
    /// </summary>
    public CodeExecutionUpdate(Recorded value)
    {
        Type = "recorded";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of CodeExecutionUpdate with <see cref="InvalidRequest"/>.
    /// </summary>
    public CodeExecutionUpdate(InvalidRequest value)
    {
        Type = "invalidRequest";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of CodeExecutionUpdate with <see cref="Finished"/>.
    /// </summary>
    public CodeExecutionUpdate(Finished value)
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
    /// Returns true if <see cref="Type"/> is "buildingExecutor"
    /// </summary>
    public bool IsBuildingExecutor => Type == "buildingExecutor";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "running"
    /// </summary>
    public bool IsRunning => Type == "running";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "errored"
    /// </summary>
    public bool IsErrored => Type == "errored";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "stopped"
    /// </summary>
    public bool IsStopped => Type == "stopped";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "graded"
    /// </summary>
    public bool IsGraded => Type == "graded";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "gradedV2"
    /// </summary>
    public bool IsGradedV2 => Type == "gradedV2";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "workspaceRan"
    /// </summary>
    public bool IsWorkspaceRan => Type == "workspaceRan";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "recording"
    /// </summary>
    public bool IsRecording => Type == "recording";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "recorded"
    /// </summary>
    public bool IsRecorded => Type == "recorded";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "invalidRequest"
    /// </summary>
    public bool IsInvalidRequest => Type == "invalidRequest";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "finished"
    /// </summary>
    public bool IsFinished => Type == "finished";

    /// <summary>
    /// Returns the value as a <see cref="BuildingExecutorResponse"/> if <see cref="Type"/> is 'buildingExecutor', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'buildingExecutor'.</exception>
    public BuildingExecutorResponse AsBuildingExecutor() =>
        IsBuildingExecutor
            ? (BuildingExecutorResponse)Value!
            : throw new Exception("SeedTrace.CodeExecutionUpdate.Type is not 'buildingExecutor'");

    /// <summary>
    /// Returns the value as a <see cref="RunningResponse"/> if <see cref="Type"/> is 'running', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'running'.</exception>
    public RunningResponse AsRunning() =>
        IsRunning
            ? (RunningResponse)Value!
            : throw new Exception("SeedTrace.CodeExecutionUpdate.Type is not 'running'");

    /// <summary>
    /// Returns the value as a <see cref="ErroredResponse"/> if <see cref="Type"/> is 'errored', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'errored'.</exception>
    public ErroredResponse AsErrored() =>
        IsErrored
            ? (ErroredResponse)Value!
            : throw new Exception("SeedTrace.CodeExecutionUpdate.Type is not 'errored'");

    /// <summary>
    /// Returns the value as a <see cref="StoppedResponse"/> if <see cref="Type"/> is 'stopped', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'stopped'.</exception>
    public StoppedResponse AsStopped() =>
        IsStopped
            ? (StoppedResponse)Value!
            : throw new Exception("SeedTrace.CodeExecutionUpdate.Type is not 'stopped'");

    /// <summary>
    /// Returns the value as a <see cref="GradedResponse"/> if <see cref="Type"/> is 'graded', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'graded'.</exception>
    public GradedResponse AsGraded() =>
        IsGraded
            ? (GradedResponse)Value!
            : throw new Exception("SeedTrace.CodeExecutionUpdate.Type is not 'graded'");

    /// <summary>
    /// Returns the value as a <see cref="GradedResponseV2"/> if <see cref="Type"/> is 'gradedV2', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'gradedV2'.</exception>
    public GradedResponseV2 AsGradedV2() =>
        IsGradedV2
            ? (GradedResponseV2)Value!
            : throw new Exception("SeedTrace.CodeExecutionUpdate.Type is not 'gradedV2'");

    /// <summary>
    /// Returns the value as a <see cref="WorkspaceRanResponse"/> if <see cref="Type"/> is 'workspaceRan', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'workspaceRan'.</exception>
    public WorkspaceRanResponse AsWorkspaceRan() =>
        IsWorkspaceRan
            ? (WorkspaceRanResponse)Value!
            : throw new Exception("SeedTrace.CodeExecutionUpdate.Type is not 'workspaceRan'");

    /// <summary>
    /// Returns the value as a <see cref="RecordingResponseNotification"/> if <see cref="Type"/> is 'recording', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'recording'.</exception>
    public RecordingResponseNotification AsRecording() =>
        IsRecording
            ? (RecordingResponseNotification)Value!
            : throw new Exception("SeedTrace.CodeExecutionUpdate.Type is not 'recording'");

    /// <summary>
    /// Returns the value as a <see cref="RecordedResponseNotification"/> if <see cref="Type"/> is 'recorded', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'recorded'.</exception>
    public RecordedResponseNotification AsRecorded() =>
        IsRecorded
            ? (RecordedResponseNotification)Value!
            : throw new Exception("SeedTrace.CodeExecutionUpdate.Type is not 'recorded'");

    /// <summary>
    /// Returns the value as a <see cref="InvalidRequestResponse"/> if <see cref="Type"/> is 'invalidRequest', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'invalidRequest'.</exception>
    public InvalidRequestResponse AsInvalidRequest() =>
        IsInvalidRequest
            ? (InvalidRequestResponse)Value!
            : throw new Exception("SeedTrace.CodeExecutionUpdate.Type is not 'invalidRequest'");

    /// <summary>
    /// Returns the value as a <see cref="FinishedResponse"/> if <see cref="Type"/> is 'finished', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'finished'.</exception>
    public FinishedResponse AsFinished() =>
        IsFinished
            ? (FinishedResponse)Value!
            : throw new Exception("SeedTrace.CodeExecutionUpdate.Type is not 'finished'");

    public T Match<T>(
        Func<BuildingExecutorResponse, T> onBuildingExecutor,
        Func<RunningResponse, T> onRunning,
        Func<ErroredResponse, T> onErrored,
        Func<StoppedResponse, T> onStopped,
        Func<GradedResponse, T> onGraded,
        Func<GradedResponseV2, T> onGradedV2,
        Func<WorkspaceRanResponse, T> onWorkspaceRan,
        Func<RecordingResponseNotification, T> onRecording,
        Func<RecordedResponseNotification, T> onRecorded,
        Func<InvalidRequestResponse, T> onInvalidRequest,
        Func<FinishedResponse, T> onFinished,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "buildingExecutor" => onBuildingExecutor(AsBuildingExecutor()),
            "running" => onRunning(AsRunning()),
            "errored" => onErrored(AsErrored()),
            "stopped" => onStopped(AsStopped()),
            "graded" => onGraded(AsGraded()),
            "gradedV2" => onGradedV2(AsGradedV2()),
            "workspaceRan" => onWorkspaceRan(AsWorkspaceRan()),
            "recording" => onRecording(AsRecording()),
            "recorded" => onRecorded(AsRecorded()),
            "invalidRequest" => onInvalidRequest(AsInvalidRequest()),
            "finished" => onFinished(AsFinished()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<BuildingExecutorResponse> onBuildingExecutor,
        Action<RunningResponse> onRunning,
        Action<ErroredResponse> onErrored,
        Action<StoppedResponse> onStopped,
        Action<GradedResponse> onGraded,
        Action<GradedResponseV2> onGradedV2,
        Action<WorkspaceRanResponse> onWorkspaceRan,
        Action<RecordingResponseNotification> onRecording,
        Action<RecordedResponseNotification> onRecorded,
        Action<InvalidRequestResponse> onInvalidRequest,
        Action<FinishedResponse> onFinished,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "buildingExecutor":
                onBuildingExecutor(AsBuildingExecutor());
                break;
            case "running":
                onRunning(AsRunning());
                break;
            case "errored":
                onErrored(AsErrored());
                break;
            case "stopped":
                onStopped(AsStopped());
                break;
            case "graded":
                onGraded(AsGraded());
                break;
            case "gradedV2":
                onGradedV2(AsGradedV2());
                break;
            case "workspaceRan":
                onWorkspaceRan(AsWorkspaceRan());
                break;
            case "recording":
                onRecording(AsRecording());
                break;
            case "recorded":
                onRecorded(AsRecorded());
                break;
            case "invalidRequest":
                onInvalidRequest(AsInvalidRequest());
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
    /// Attempts to cast the value to a <see cref="BuildingExecutorResponse"/> and returns true if successful.
    /// </summary>
    public bool TryAsBuildingExecutor(out BuildingExecutorResponse? value)
    {
        if (Type == "buildingExecutor")
        {
            value = (BuildingExecutorResponse)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="RunningResponse"/> and returns true if successful.
    /// </summary>
    public bool TryAsRunning(out RunningResponse? value)
    {
        if (Type == "running")
        {
            value = (RunningResponse)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="ErroredResponse"/> and returns true if successful.
    /// </summary>
    public bool TryAsErrored(out ErroredResponse? value)
    {
        if (Type == "errored")
        {
            value = (ErroredResponse)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="StoppedResponse"/> and returns true if successful.
    /// </summary>
    public bool TryAsStopped(out StoppedResponse? value)
    {
        if (Type == "stopped")
        {
            value = (StoppedResponse)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="GradedResponse"/> and returns true if successful.
    /// </summary>
    public bool TryAsGraded(out GradedResponse? value)
    {
        if (Type == "graded")
        {
            value = (GradedResponse)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="GradedResponseV2"/> and returns true if successful.
    /// </summary>
    public bool TryAsGradedV2(out GradedResponseV2? value)
    {
        if (Type == "gradedV2")
        {
            value = (GradedResponseV2)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="WorkspaceRanResponse"/> and returns true if successful.
    /// </summary>
    public bool TryAsWorkspaceRan(out WorkspaceRanResponse? value)
    {
        if (Type == "workspaceRan")
        {
            value = (WorkspaceRanResponse)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="RecordingResponseNotification"/> and returns true if successful.
    /// </summary>
    public bool TryAsRecording(out RecordingResponseNotification? value)
    {
        if (Type == "recording")
        {
            value = (RecordingResponseNotification)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="RecordedResponseNotification"/> and returns true if successful.
    /// </summary>
    public bool TryAsRecorded(out RecordedResponseNotification? value)
    {
        if (Type == "recorded")
        {
            value = (RecordedResponseNotification)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="InvalidRequestResponse"/> and returns true if successful.
    /// </summary>
    public bool TryAsInvalidRequest(out InvalidRequestResponse? value)
    {
        if (Type == "invalidRequest")
        {
            value = (InvalidRequestResponse)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="FinishedResponse"/> and returns true if successful.
    /// </summary>
    public bool TryAsFinished(out FinishedResponse? value)
    {
        if (Type == "finished")
        {
            value = (FinishedResponse)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator CodeExecutionUpdate(BuildingExecutor value) => new(value);

    public static implicit operator CodeExecutionUpdate(Running value) => new(value);

    public static implicit operator CodeExecutionUpdate(Errored value) => new(value);

    public static implicit operator CodeExecutionUpdate(Stopped value) => new(value);

    public static implicit operator CodeExecutionUpdate(Graded value) => new(value);

    public static implicit operator CodeExecutionUpdate(GradedV2 value) => new(value);

    public static implicit operator CodeExecutionUpdate(WorkspaceRan value) => new(value);

    public static implicit operator CodeExecutionUpdate(Recording value) => new(value);

    public static implicit operator CodeExecutionUpdate(Recorded value) => new(value);

    public static implicit operator CodeExecutionUpdate(InvalidRequest value) => new(value);

    public static implicit operator CodeExecutionUpdate(Finished value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<CodeExecutionUpdate>
    {
        public override bool CanConvert(Type typeToConvert) =>
            typeof(CodeExecutionUpdate).IsAssignableFrom(typeToConvert);

        public override CodeExecutionUpdate Read(
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
                "buildingExecutor" => json.Deserialize<BuildingExecutorResponse>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.BuildingExecutorResponse"
                    ),
                "running" => json.Deserialize<RunningResponse>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.RunningResponse"),
                "errored" => json.Deserialize<ErroredResponse>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.ErroredResponse"),
                "stopped" => json.Deserialize<StoppedResponse>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.StoppedResponse"),
                "graded" => json.Deserialize<GradedResponse>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.GradedResponse"),
                "gradedV2" => json.Deserialize<GradedResponseV2>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.GradedResponseV2"),
                "workspaceRan" => json.Deserialize<WorkspaceRanResponse>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.WorkspaceRanResponse"
                    ),
                "recording" => json.Deserialize<RecordingResponseNotification>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.RecordingResponseNotification"
                    ),
                "recorded" => json.Deserialize<RecordedResponseNotification>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.RecordedResponseNotification"
                    ),
                "invalidRequest" => json.Deserialize<InvalidRequestResponse>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.InvalidRequestResponse"
                    ),
                "finished" => json.Deserialize<FinishedResponse>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.FinishedResponse"),
                _ => json.Deserialize<object?>(options),
            };
            return new CodeExecutionUpdate(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            CodeExecutionUpdate value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "buildingExecutor" => JsonSerializer.SerializeToNode(value.Value, options),
                    "running" => JsonSerializer.SerializeToNode(value.Value, options),
                    "errored" => JsonSerializer.SerializeToNode(value.Value, options),
                    "stopped" => JsonSerializer.SerializeToNode(value.Value, options),
                    "graded" => JsonSerializer.SerializeToNode(value.Value, options),
                    "gradedV2" => JsonSerializer.SerializeToNode(value.Value, options),
                    "workspaceRan" => JsonSerializer.SerializeToNode(value.Value, options),
                    "recording" => JsonSerializer.SerializeToNode(value.Value, options),
                    "recorded" => JsonSerializer.SerializeToNode(value.Value, options),
                    "invalidRequest" => JsonSerializer.SerializeToNode(value.Value, options),
                    "finished" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for buildingExecutor
    /// </summary>
    [Serializable]
    public struct BuildingExecutor
    {
        public BuildingExecutor(BuildingExecutorResponse value)
        {
            Value = value;
        }

        internal BuildingExecutorResponse Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator BuildingExecutor(BuildingExecutorResponse value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for running
    /// </summary>
    [Serializable]
    public struct Running
    {
        public Running(RunningResponse value)
        {
            Value = value;
        }

        internal RunningResponse Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator Running(RunningResponse value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for errored
    /// </summary>
    [Serializable]
    public struct Errored
    {
        public Errored(ErroredResponse value)
        {
            Value = value;
        }

        internal ErroredResponse Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator Errored(ErroredResponse value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for stopped
    /// </summary>
    [Serializable]
    public struct Stopped
    {
        public Stopped(StoppedResponse value)
        {
            Value = value;
        }

        internal StoppedResponse Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator Stopped(StoppedResponse value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for graded
    /// </summary>
    [Serializable]
    public struct Graded
    {
        public Graded(GradedResponse value)
        {
            Value = value;
        }

        internal GradedResponse Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator Graded(GradedResponse value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for gradedV2
    /// </summary>
    [Serializable]
    public struct GradedV2
    {
        public GradedV2(GradedResponseV2 value)
        {
            Value = value;
        }

        internal GradedResponseV2 Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator GradedV2(GradedResponseV2 value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for workspaceRan
    /// </summary>
    [Serializable]
    public struct WorkspaceRan
    {
        public WorkspaceRan(WorkspaceRanResponse value)
        {
            Value = value;
        }

        internal WorkspaceRanResponse Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator WorkspaceRan(WorkspaceRanResponse value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for recording
    /// </summary>
    [Serializable]
    public struct Recording
    {
        public Recording(RecordingResponseNotification value)
        {
            Value = value;
        }

        internal RecordingResponseNotification Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator Recording(RecordingResponseNotification value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for recorded
    /// </summary>
    [Serializable]
    public struct Recorded
    {
        public Recorded(RecordedResponseNotification value)
        {
            Value = value;
        }

        internal RecordedResponseNotification Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator Recorded(RecordedResponseNotification value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for invalidRequest
    /// </summary>
    [Serializable]
    public struct InvalidRequest
    {
        public InvalidRequest(InvalidRequestResponse value)
        {
            Value = value;
        }

        internal InvalidRequestResponse Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator InvalidRequest(InvalidRequestResponse value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for finished
    /// </summary>
    [Serializable]
    public struct Finished
    {
        public Finished(FinishedResponse value)
        {
            Value = value;
        }

        internal FinishedResponse Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator Finished(FinishedResponse value) => new(value);
    }
}
