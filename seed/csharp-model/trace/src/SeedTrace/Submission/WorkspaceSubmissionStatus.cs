// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(WorkspaceSubmissionStatus.JsonConverter))]
[Serializable]
public record WorkspaceSubmissionStatus
{
    internal WorkspaceSubmissionStatus(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of WorkspaceSubmissionStatus with <see cref="WorkspaceSubmissionStatus.Stopped"/>.
    /// </summary>
    public WorkspaceSubmissionStatus(WorkspaceSubmissionStatus.Stopped value)
    {
        Type = "stopped";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of WorkspaceSubmissionStatus with <see cref="WorkspaceSubmissionStatus.Errored"/>.
    /// </summary>
    public WorkspaceSubmissionStatus(WorkspaceSubmissionStatus.Errored value)
    {
        Type = "errored";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of WorkspaceSubmissionStatus with <see cref="WorkspaceSubmissionStatus.Running"/>.
    /// </summary>
    public WorkspaceSubmissionStatus(WorkspaceSubmissionStatus.Running value)
    {
        Type = "running";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of WorkspaceSubmissionStatus with <see cref="WorkspaceSubmissionStatus.Ran"/>.
    /// </summary>
    public WorkspaceSubmissionStatus(WorkspaceSubmissionStatus.Ran value)
    {
        Type = "ran";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of WorkspaceSubmissionStatus with <see cref="WorkspaceSubmissionStatus.Traced"/>.
    /// </summary>
    public WorkspaceSubmissionStatus(WorkspaceSubmissionStatus.Traced value)
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
    /// Returns true if <see cref="Type"/> is "ran"
    /// </summary>
    public bool IsRan => Type == "ran";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "traced"
    /// </summary>
    public bool IsTraced => Type == "traced";

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'stopped', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'stopped'.</exception>
    public object AsStopped() =>
        IsStopped
            ? Value!
            : throw new System.Exception("WorkspaceSubmissionStatus.Type is not 'stopped'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.ErrorInfo"/> if <see cref="Type"/> is 'errored', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'errored'.</exception>
    public SeedTrace.ErrorInfo AsErrored() =>
        IsErrored
            ? (SeedTrace.ErrorInfo)Value!
            : throw new System.Exception("WorkspaceSubmissionStatus.Type is not 'errored'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.RunningSubmissionState"/> if <see cref="Type"/> is 'running', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'running'.</exception>
    public SeedTrace.RunningSubmissionState AsRunning() =>
        IsRunning
            ? (SeedTrace.RunningSubmissionState)Value!
            : throw new System.Exception("WorkspaceSubmissionStatus.Type is not 'running'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.WorkspaceRunDetails"/> if <see cref="Type"/> is 'ran', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'ran'.</exception>
    public SeedTrace.WorkspaceRunDetails AsRan() =>
        IsRan
            ? (SeedTrace.WorkspaceRunDetails)Value!
            : throw new System.Exception("WorkspaceSubmissionStatus.Type is not 'ran'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.WorkspaceRunDetails"/> if <see cref="Type"/> is 'traced', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'traced'.</exception>
    public SeedTrace.WorkspaceRunDetails AsTraced() =>
        IsTraced
            ? (SeedTrace.WorkspaceRunDetails)Value!
            : throw new System.Exception("WorkspaceSubmissionStatus.Type is not 'traced'");

    public T Match<T>(
        Func<object, T> onStopped,
        Func<SeedTrace.ErrorInfo, T> onErrored,
        Func<SeedTrace.RunningSubmissionState, T> onRunning,
        Func<SeedTrace.WorkspaceRunDetails, T> onRan,
        Func<SeedTrace.WorkspaceRunDetails, T> onTraced,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "stopped" => onStopped(AsStopped()),
            "errored" => onErrored(AsErrored()),
            "running" => onRunning(AsRunning()),
            "ran" => onRan(AsRan()),
            "traced" => onTraced(AsTraced()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<object> onStopped,
        Action<SeedTrace.ErrorInfo> onErrored,
        Action<SeedTrace.RunningSubmissionState> onRunning,
        Action<SeedTrace.WorkspaceRunDetails> onRan,
        Action<SeedTrace.WorkspaceRunDetails> onTraced,
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
            case "ran":
                onRan(AsRan());
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
    /// Attempts to cast the value to a <see cref="SeedTrace.WorkspaceRunDetails"/> and returns true if successful.
    /// </summary>
    public bool TryAsTraced(out SeedTrace.WorkspaceRunDetails? value)
    {
        if (Type == "traced")
        {
            value = (SeedTrace.WorkspaceRunDetails)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator WorkspaceSubmissionStatus(
        WorkspaceSubmissionStatus.Errored value
    ) => new(value);

    public static implicit operator WorkspaceSubmissionStatus(
        WorkspaceSubmissionStatus.Running value
    ) => new(value);

    public static implicit operator WorkspaceSubmissionStatus(
        WorkspaceSubmissionStatus.Ran value
    ) => new(value);

    public static implicit operator WorkspaceSubmissionStatus(
        WorkspaceSubmissionStatus.Traced value
    ) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<WorkspaceSubmissionStatus>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(WorkspaceSubmissionStatus).IsAssignableFrom(typeToConvert);

        public override WorkspaceSubmissionStatus Read(
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
                "ran" => json.Deserialize<SeedTrace.WorkspaceRunDetails?>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.WorkspaceRunDetails"
                    ),
                "traced" => json.Deserialize<SeedTrace.WorkspaceRunDetails?>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.WorkspaceRunDetails"
                    ),
                _ => json.Deserialize<object?>(options),
            };
            return new WorkspaceSubmissionStatus(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            WorkspaceSubmissionStatus value,
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
                    "ran" => JsonSerializer.SerializeToNode(value.Value, options),
                    "traced" => JsonSerializer.SerializeToNode(value.Value, options),
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

        public static implicit operator WorkspaceSubmissionStatus.Errored(
            SeedTrace.ErrorInfo value
        ) => new(value);
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

        public static implicit operator WorkspaceSubmissionStatus.Running(
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

        public static implicit operator WorkspaceSubmissionStatus.Ran(
            SeedTrace.WorkspaceRunDetails value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for traced
    /// </summary>
    [Serializable]
    public struct Traced
    {
        public Traced(SeedTrace.WorkspaceRunDetails value)
        {
            Value = value;
        }

        internal SeedTrace.WorkspaceRunDetails Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator WorkspaceSubmissionStatus.Traced(
            SeedTrace.WorkspaceRunDetails value
        ) => new(value);
    }
}
