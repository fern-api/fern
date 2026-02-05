// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(CodeExecutionUpdate.JsonConverter))]
[Serializable]
public record CodeExecutionUpdate
{
    internal CodeExecutionUpdate(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of CodeExecutionUpdate with <see cref="CodeExecutionUpdate.BuildingExecutor"/>.
    /// </summary>
    public CodeExecutionUpdate(CodeExecutionUpdate.BuildingExecutor value)
    {
        Type = "buildingExecutor";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of CodeExecutionUpdate with <see cref="CodeExecutionUpdate.Running"/>.
    /// </summary>
    public CodeExecutionUpdate(CodeExecutionUpdate.Running value)
    {
        Type = "running";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of CodeExecutionUpdate with <see cref="CodeExecutionUpdate.Errored"/>.
    /// </summary>
    public CodeExecutionUpdate(CodeExecutionUpdate.Errored value)
    {
        Type = "errored";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of CodeExecutionUpdate with <see cref="CodeExecutionUpdate.Stopped"/>.
    /// </summary>
    public CodeExecutionUpdate(CodeExecutionUpdate.Stopped value)
    {
        Type = "stopped";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of CodeExecutionUpdate with <see cref="CodeExecutionUpdate.Graded"/>.
    /// </summary>
    public CodeExecutionUpdate(CodeExecutionUpdate.Graded value)
    {
        Type = "graded";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of CodeExecutionUpdate with <see cref="CodeExecutionUpdate.GradedV2"/>.
    /// </summary>
    public CodeExecutionUpdate(CodeExecutionUpdate.GradedV2 value)
    {
        Type = "gradedV2";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of CodeExecutionUpdate with <see cref="CodeExecutionUpdate.WorkspaceRan"/>.
    /// </summary>
    public CodeExecutionUpdate(CodeExecutionUpdate.WorkspaceRan value)
    {
        Type = "workspaceRan";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of CodeExecutionUpdate with <see cref="CodeExecutionUpdate.Recording"/>.
    /// </summary>
    public CodeExecutionUpdate(CodeExecutionUpdate.Recording value)
    {
        Type = "recording";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of CodeExecutionUpdate with <see cref="CodeExecutionUpdate.Recorded"/>.
    /// </summary>
    public CodeExecutionUpdate(CodeExecutionUpdate.Recorded value)
    {
        Type = "recorded";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of CodeExecutionUpdate with <see cref="CodeExecutionUpdate.InvalidRequest"/>.
    /// </summary>
    public CodeExecutionUpdate(CodeExecutionUpdate.InvalidRequest value)
    {
        Type = "invalidRequest";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of CodeExecutionUpdate with <see cref="CodeExecutionUpdate.Finished"/>.
    /// </summary>
    public CodeExecutionUpdate(CodeExecutionUpdate.Finished value)
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
    /// Returns the value as a <see cref="SeedTrace.BuildingExecutorResponse"/> if <see cref="Type"/> is 'buildingExecutor', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'buildingExecutor'.</exception>
    public SeedTrace.BuildingExecutorResponse AsBuildingExecutor() =>
        IsBuildingExecutor
            ? (SeedTrace.BuildingExecutorResponse)Value!
            : throw new System.Exception("CodeExecutionUpdate.Type is not 'buildingExecutor'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.RunningResponse"/> if <see cref="Type"/> is 'running', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'running'.</exception>
    public SeedTrace.RunningResponse AsRunning() =>
        IsRunning
            ? (SeedTrace.RunningResponse)Value!
            : throw new System.Exception("CodeExecutionUpdate.Type is not 'running'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.ErroredResponse"/> if <see cref="Type"/> is 'errored', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'errored'.</exception>
    public SeedTrace.ErroredResponse AsErrored() =>
        IsErrored
            ? (SeedTrace.ErroredResponse)Value!
            : throw new System.Exception("CodeExecutionUpdate.Type is not 'errored'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.StoppedResponse"/> if <see cref="Type"/> is 'stopped', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'stopped'.</exception>
    public SeedTrace.StoppedResponse AsStopped() =>
        IsStopped
            ? (SeedTrace.StoppedResponse)Value!
            : throw new System.Exception("CodeExecutionUpdate.Type is not 'stopped'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.GradedResponse"/> if <see cref="Type"/> is 'graded', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'graded'.</exception>
    public SeedTrace.GradedResponse AsGraded() =>
        IsGraded
            ? (SeedTrace.GradedResponse)Value!
            : throw new System.Exception("CodeExecutionUpdate.Type is not 'graded'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.GradedResponseV2"/> if <see cref="Type"/> is 'gradedV2', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'gradedV2'.</exception>
    public SeedTrace.GradedResponseV2 AsGradedV2() =>
        IsGradedV2
            ? (SeedTrace.GradedResponseV2)Value!
            : throw new System.Exception("CodeExecutionUpdate.Type is not 'gradedV2'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.WorkspaceRanResponse"/> if <see cref="Type"/> is 'workspaceRan', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'workspaceRan'.</exception>
    public SeedTrace.WorkspaceRanResponse AsWorkspaceRan() =>
        IsWorkspaceRan
            ? (SeedTrace.WorkspaceRanResponse)Value!
            : throw new System.Exception("CodeExecutionUpdate.Type is not 'workspaceRan'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.RecordingResponseNotification"/> if <see cref="Type"/> is 'recording', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'recording'.</exception>
    public SeedTrace.RecordingResponseNotification AsRecording() =>
        IsRecording
            ? (SeedTrace.RecordingResponseNotification)Value!
            : throw new System.Exception("CodeExecutionUpdate.Type is not 'recording'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.RecordedResponseNotification"/> if <see cref="Type"/> is 'recorded', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'recorded'.</exception>
    public SeedTrace.RecordedResponseNotification AsRecorded() =>
        IsRecorded
            ? (SeedTrace.RecordedResponseNotification)Value!
            : throw new System.Exception("CodeExecutionUpdate.Type is not 'recorded'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.InvalidRequestResponse"/> if <see cref="Type"/> is 'invalidRequest', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'invalidRequest'.</exception>
    public SeedTrace.InvalidRequestResponse AsInvalidRequest() =>
        IsInvalidRequest
            ? (SeedTrace.InvalidRequestResponse)Value!
            : throw new System.Exception("CodeExecutionUpdate.Type is not 'invalidRequest'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.FinishedResponse"/> if <see cref="Type"/> is 'finished', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'finished'.</exception>
    public SeedTrace.FinishedResponse AsFinished() =>
        IsFinished
            ? (SeedTrace.FinishedResponse)Value!
            : throw new System.Exception("CodeExecutionUpdate.Type is not 'finished'");

    public T Match<T>(
        Func<SeedTrace.BuildingExecutorResponse, T> onBuildingExecutor,
        Func<SeedTrace.RunningResponse, T> onRunning,
        Func<SeedTrace.ErroredResponse, T> onErrored,
        Func<SeedTrace.StoppedResponse, T> onStopped,
        Func<SeedTrace.GradedResponse, T> onGraded,
        Func<SeedTrace.GradedResponseV2, T> onGradedV2,
        Func<SeedTrace.WorkspaceRanResponse, T> onWorkspaceRan,
        Func<SeedTrace.RecordingResponseNotification, T> onRecording,
        Func<SeedTrace.RecordedResponseNotification, T> onRecorded,
        Func<SeedTrace.InvalidRequestResponse, T> onInvalidRequest,
        Func<SeedTrace.FinishedResponse, T> onFinished,
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
        Action<SeedTrace.BuildingExecutorResponse> onBuildingExecutor,
        Action<SeedTrace.RunningResponse> onRunning,
        Action<SeedTrace.ErroredResponse> onErrored,
        Action<SeedTrace.StoppedResponse> onStopped,
        Action<SeedTrace.GradedResponse> onGraded,
        Action<SeedTrace.GradedResponseV2> onGradedV2,
        Action<SeedTrace.WorkspaceRanResponse> onWorkspaceRan,
        Action<SeedTrace.RecordingResponseNotification> onRecording,
        Action<SeedTrace.RecordedResponseNotification> onRecorded,
        Action<SeedTrace.InvalidRequestResponse> onInvalidRequest,
        Action<SeedTrace.FinishedResponse> onFinished,
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
    /// Attempts to cast the value to a <see cref="SeedTrace.BuildingExecutorResponse"/> and returns true if successful.
    /// </summary>
    public bool TryAsBuildingExecutor(out SeedTrace.BuildingExecutorResponse? value)
    {
        if (Type == "buildingExecutor")
        {
            value = (SeedTrace.BuildingExecutorResponse)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.RunningResponse"/> and returns true if successful.
    /// </summary>
    public bool TryAsRunning(out SeedTrace.RunningResponse? value)
    {
        if (Type == "running")
        {
            value = (SeedTrace.RunningResponse)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.ErroredResponse"/> and returns true if successful.
    /// </summary>
    public bool TryAsErrored(out SeedTrace.ErroredResponse? value)
    {
        if (Type == "errored")
        {
            value = (SeedTrace.ErroredResponse)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.StoppedResponse"/> and returns true if successful.
    /// </summary>
    public bool TryAsStopped(out SeedTrace.StoppedResponse? value)
    {
        if (Type == "stopped")
        {
            value = (SeedTrace.StoppedResponse)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.GradedResponse"/> and returns true if successful.
    /// </summary>
    public bool TryAsGraded(out SeedTrace.GradedResponse? value)
    {
        if (Type == "graded")
        {
            value = (SeedTrace.GradedResponse)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.GradedResponseV2"/> and returns true if successful.
    /// </summary>
    public bool TryAsGradedV2(out SeedTrace.GradedResponseV2? value)
    {
        if (Type == "gradedV2")
        {
            value = (SeedTrace.GradedResponseV2)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.WorkspaceRanResponse"/> and returns true if successful.
    /// </summary>
    public bool TryAsWorkspaceRan(out SeedTrace.WorkspaceRanResponse? value)
    {
        if (Type == "workspaceRan")
        {
            value = (SeedTrace.WorkspaceRanResponse)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.RecordingResponseNotification"/> and returns true if successful.
    /// </summary>
    public bool TryAsRecording(out SeedTrace.RecordingResponseNotification? value)
    {
        if (Type == "recording")
        {
            value = (SeedTrace.RecordingResponseNotification)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.RecordedResponseNotification"/> and returns true if successful.
    /// </summary>
    public bool TryAsRecorded(out SeedTrace.RecordedResponseNotification? value)
    {
        if (Type == "recorded")
        {
            value = (SeedTrace.RecordedResponseNotification)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.InvalidRequestResponse"/> and returns true if successful.
    /// </summary>
    public bool TryAsInvalidRequest(out SeedTrace.InvalidRequestResponse? value)
    {
        if (Type == "invalidRequest")
        {
            value = (SeedTrace.InvalidRequestResponse)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.FinishedResponse"/> and returns true if successful.
    /// </summary>
    public bool TryAsFinished(out SeedTrace.FinishedResponse? value)
    {
        if (Type == "finished")
        {
            value = (SeedTrace.FinishedResponse)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator CodeExecutionUpdate(
        CodeExecutionUpdate.BuildingExecutor value
    ) => new(value);

    public static implicit operator CodeExecutionUpdate(CodeExecutionUpdate.Running value) =>
        new(value);

    public static implicit operator CodeExecutionUpdate(CodeExecutionUpdate.Errored value) =>
        new(value);

    public static implicit operator CodeExecutionUpdate(CodeExecutionUpdate.Stopped value) =>
        new(value);

    public static implicit operator CodeExecutionUpdate(CodeExecutionUpdate.Graded value) =>
        new(value);

    public static implicit operator CodeExecutionUpdate(CodeExecutionUpdate.GradedV2 value) =>
        new(value);

    public static implicit operator CodeExecutionUpdate(CodeExecutionUpdate.WorkspaceRan value) =>
        new(value);

    public static implicit operator CodeExecutionUpdate(CodeExecutionUpdate.Recording value) =>
        new(value);

    public static implicit operator CodeExecutionUpdate(CodeExecutionUpdate.Recorded value) =>
        new(value);

    public static implicit operator CodeExecutionUpdate(CodeExecutionUpdate.InvalidRequest value) =>
        new(value);

    public static implicit operator CodeExecutionUpdate(CodeExecutionUpdate.Finished value) =>
        new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<CodeExecutionUpdate>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(CodeExecutionUpdate).IsAssignableFrom(typeToConvert);

        public override CodeExecutionUpdate Read(
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
                "buildingExecutor" => json.Deserialize<SeedTrace.BuildingExecutorResponse?>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.BuildingExecutorResponse"
                    ),
                "running" => json.Deserialize<SeedTrace.RunningResponse?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.RunningResponse"),
                "errored" => json.Deserialize<SeedTrace.ErroredResponse?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.ErroredResponse"),
                "stopped" => json.Deserialize<SeedTrace.StoppedResponse?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.StoppedResponse"),
                "graded" => json.Deserialize<SeedTrace.GradedResponse?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.GradedResponse"),
                "gradedV2" => json.Deserialize<SeedTrace.GradedResponseV2?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.GradedResponseV2"),
                "workspaceRan" => json.Deserialize<SeedTrace.WorkspaceRanResponse?>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.WorkspaceRanResponse"
                    ),
                "recording" => json.Deserialize<SeedTrace.RecordingResponseNotification?>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.RecordingResponseNotification"
                    ),
                "recorded" => json.Deserialize<SeedTrace.RecordedResponseNotification?>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.RecordedResponseNotification"
                    ),
                "invalidRequest" => json.Deserialize<SeedTrace.InvalidRequestResponse?>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.InvalidRequestResponse"
                    ),
                "finished" => json.Deserialize<SeedTrace.FinishedResponse?>(options)
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
        public BuildingExecutor(SeedTrace.BuildingExecutorResponse value)
        {
            Value = value;
        }

        internal SeedTrace.BuildingExecutorResponse Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator CodeExecutionUpdate.BuildingExecutor(
            SeedTrace.BuildingExecutorResponse value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for running
    /// </summary>
    [Serializable]
    public struct Running
    {
        public Running(SeedTrace.RunningResponse value)
        {
            Value = value;
        }

        internal SeedTrace.RunningResponse Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator CodeExecutionUpdate.Running(
            SeedTrace.RunningResponse value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for errored
    /// </summary>
    [Serializable]
    public struct Errored
    {
        public Errored(SeedTrace.ErroredResponse value)
        {
            Value = value;
        }

        internal SeedTrace.ErroredResponse Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator CodeExecutionUpdate.Errored(
            SeedTrace.ErroredResponse value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for stopped
    /// </summary>
    [Serializable]
    public struct Stopped
    {
        public Stopped(SeedTrace.StoppedResponse value)
        {
            Value = value;
        }

        internal SeedTrace.StoppedResponse Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator CodeExecutionUpdate.Stopped(
            SeedTrace.StoppedResponse value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for graded
    /// </summary>
    [Serializable]
    public struct Graded
    {
        public Graded(SeedTrace.GradedResponse value)
        {
            Value = value;
        }

        internal SeedTrace.GradedResponse Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator CodeExecutionUpdate.Graded(
            SeedTrace.GradedResponse value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for gradedV2
    /// </summary>
    [Serializable]
    public struct GradedV2
    {
        public GradedV2(SeedTrace.GradedResponseV2 value)
        {
            Value = value;
        }

        internal SeedTrace.GradedResponseV2 Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator CodeExecutionUpdate.GradedV2(
            SeedTrace.GradedResponseV2 value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for workspaceRan
    /// </summary>
    [Serializable]
    public struct WorkspaceRan
    {
        public WorkspaceRan(SeedTrace.WorkspaceRanResponse value)
        {
            Value = value;
        }

        internal SeedTrace.WorkspaceRanResponse Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator CodeExecutionUpdate.WorkspaceRan(
            SeedTrace.WorkspaceRanResponse value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for recording
    /// </summary>
    [Serializable]
    public struct Recording
    {
        public Recording(SeedTrace.RecordingResponseNotification value)
        {
            Value = value;
        }

        internal SeedTrace.RecordingResponseNotification Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator CodeExecutionUpdate.Recording(
            SeedTrace.RecordingResponseNotification value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for recorded
    /// </summary>
    [Serializable]
    public struct Recorded
    {
        public Recorded(SeedTrace.RecordedResponseNotification value)
        {
            Value = value;
        }

        internal SeedTrace.RecordedResponseNotification Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator CodeExecutionUpdate.Recorded(
            SeedTrace.RecordedResponseNotification value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for invalidRequest
    /// </summary>
    [Serializable]
    public struct InvalidRequest
    {
        public InvalidRequest(SeedTrace.InvalidRequestResponse value)
        {
            Value = value;
        }

        internal SeedTrace.InvalidRequestResponse Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator CodeExecutionUpdate.InvalidRequest(
            SeedTrace.InvalidRequestResponse value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for finished
    /// </summary>
    [Serializable]
    public struct Finished
    {
        public Finished(SeedTrace.FinishedResponse value)
        {
            Value = value;
        }

        internal SeedTrace.FinishedResponse Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator CodeExecutionUpdate.Finished(
            SeedTrace.FinishedResponse value
        ) => new(value);
    }
}
