// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(SubmissionResponse.JsonConverter))]
[Serializable]
public record SubmissionResponse
{
    internal SubmissionResponse(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of SubmissionResponse with <see cref="SubmissionResponse.ServerInitialized"/>.
    /// </summary>
    public SubmissionResponse(SubmissionResponse.ServerInitialized value)
    {
        Type = "serverInitialized";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of SubmissionResponse with <see cref="SubmissionResponse.ProblemInitialized"/>.
    /// </summary>
    public SubmissionResponse(SubmissionResponse.ProblemInitialized value)
    {
        Type = "problemInitialized";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of SubmissionResponse with <see cref="SubmissionResponse.WorkspaceInitialized"/>.
    /// </summary>
    public SubmissionResponse(SubmissionResponse.WorkspaceInitialized value)
    {
        Type = "workspaceInitialized";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of SubmissionResponse with <see cref="SubmissionResponse.ServerErrored"/>.
    /// </summary>
    public SubmissionResponse(SubmissionResponse.ServerErrored value)
    {
        Type = "serverErrored";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of SubmissionResponse with <see cref="SubmissionResponse.CodeExecutionUpdate"/>.
    /// </summary>
    public SubmissionResponse(SubmissionResponse.CodeExecutionUpdate value)
    {
        Type = "codeExecutionUpdate";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of SubmissionResponse with <see cref="SubmissionResponse.Terminated"/>.
    /// </summary>
    public SubmissionResponse(SubmissionResponse.Terminated value)
    {
        Type = "terminated";
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
    /// Returns true if <see cref="Type"/> is "serverInitialized"
    /// </summary>
    public bool IsServerInitialized => Type == "serverInitialized";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "problemInitialized"
    /// </summary>
    public bool IsProblemInitialized => Type == "problemInitialized";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "workspaceInitialized"
    /// </summary>
    public bool IsWorkspaceInitialized => Type == "workspaceInitialized";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "serverErrored"
    /// </summary>
    public bool IsServerErrored => Type == "serverErrored";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "codeExecutionUpdate"
    /// </summary>
    public bool IsCodeExecutionUpdate => Type == "codeExecutionUpdate";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "terminated"
    /// </summary>
    public bool IsTerminated => Type == "terminated";

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'serverInitialized', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'serverInitialized'.</exception>
    public object AsServerInitialized() =>
        IsServerInitialized
            ? Value!
            : throw new System.Exception("SubmissionResponse.Type is not 'serverInitialized'");

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'problemInitialized', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'problemInitialized'.</exception>
    public string AsProblemInitialized() =>
        IsProblemInitialized
            ? (string)Value!
            : throw new System.Exception("SubmissionResponse.Type is not 'problemInitialized'");

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'workspaceInitialized', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'workspaceInitialized'.</exception>
    public object AsWorkspaceInitialized() =>
        IsWorkspaceInitialized
            ? Value!
            : throw new System.Exception("SubmissionResponse.Type is not 'workspaceInitialized'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.ExceptionInfo"/> if <see cref="Type"/> is 'serverErrored', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'serverErrored'.</exception>
    public SeedTrace.ExceptionInfo AsServerErrored() =>
        IsServerErrored
            ? (SeedTrace.ExceptionInfo)Value!
            : throw new System.Exception("SubmissionResponse.Type is not 'serverErrored'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.CodeExecutionUpdate"/> if <see cref="Type"/> is 'codeExecutionUpdate', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'codeExecutionUpdate'.</exception>
    public SeedTrace.CodeExecutionUpdate AsCodeExecutionUpdate() =>
        IsCodeExecutionUpdate
            ? (SeedTrace.CodeExecutionUpdate)Value!
            : throw new System.Exception("SubmissionResponse.Type is not 'codeExecutionUpdate'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.TerminatedResponse"/> if <see cref="Type"/> is 'terminated', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'terminated'.</exception>
    public SeedTrace.TerminatedResponse AsTerminated() =>
        IsTerminated
            ? (SeedTrace.TerminatedResponse)Value!
            : throw new System.Exception("SubmissionResponse.Type is not 'terminated'");

    public T Match<T>(
        Func<object, T> onServerInitialized,
        Func<string, T> onProblemInitialized,
        Func<object, T> onWorkspaceInitialized,
        Func<SeedTrace.ExceptionInfo, T> onServerErrored,
        Func<SeedTrace.CodeExecutionUpdate, T> onCodeExecutionUpdate,
        Func<SeedTrace.TerminatedResponse, T> onTerminated,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "serverInitialized" => onServerInitialized(AsServerInitialized()),
            "problemInitialized" => onProblemInitialized(AsProblemInitialized()),
            "workspaceInitialized" => onWorkspaceInitialized(AsWorkspaceInitialized()),
            "serverErrored" => onServerErrored(AsServerErrored()),
            "codeExecutionUpdate" => onCodeExecutionUpdate(AsCodeExecutionUpdate()),
            "terminated" => onTerminated(AsTerminated()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<object> onServerInitialized,
        Action<string> onProblemInitialized,
        Action<object> onWorkspaceInitialized,
        Action<SeedTrace.ExceptionInfo> onServerErrored,
        Action<SeedTrace.CodeExecutionUpdate> onCodeExecutionUpdate,
        Action<SeedTrace.TerminatedResponse> onTerminated,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "serverInitialized":
                onServerInitialized(AsServerInitialized());
                break;
            case "problemInitialized":
                onProblemInitialized(AsProblemInitialized());
                break;
            case "workspaceInitialized":
                onWorkspaceInitialized(AsWorkspaceInitialized());
                break;
            case "serverErrored":
                onServerErrored(AsServerErrored());
                break;
            case "codeExecutionUpdate":
                onCodeExecutionUpdate(AsCodeExecutionUpdate());
                break;
            case "terminated":
                onTerminated(AsTerminated());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="object"/> and returns true if successful.
    /// </summary>
    public bool TryAsServerInitialized(out object? value)
    {
        if (Type == "serverInitialized")
        {
            value = Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryAsProblemInitialized(out string? value)
    {
        if (Type == "problemInitialized")
        {
            value = (string)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="object"/> and returns true if successful.
    /// </summary>
    public bool TryAsWorkspaceInitialized(out object? value)
    {
        if (Type == "workspaceInitialized")
        {
            value = Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.ExceptionInfo"/> and returns true if successful.
    /// </summary>
    public bool TryAsServerErrored(out SeedTrace.ExceptionInfo? value)
    {
        if (Type == "serverErrored")
        {
            value = (SeedTrace.ExceptionInfo)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.CodeExecutionUpdate"/> and returns true if successful.
    /// </summary>
    public bool TryAsCodeExecutionUpdate(out SeedTrace.CodeExecutionUpdate? value)
    {
        if (Type == "codeExecutionUpdate")
        {
            value = (SeedTrace.CodeExecutionUpdate)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.TerminatedResponse"/> and returns true if successful.
    /// </summary>
    public bool TryAsTerminated(out SeedTrace.TerminatedResponse? value)
    {
        if (Type == "terminated")
        {
            value = (SeedTrace.TerminatedResponse)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator SubmissionResponse(
        SubmissionResponse.ProblemInitialized value
    ) => new(value);

    public static implicit operator SubmissionResponse(SubmissionResponse.ServerErrored value) =>
        new(value);

    public static implicit operator SubmissionResponse(
        SubmissionResponse.CodeExecutionUpdate value
    ) => new(value);

    public static implicit operator SubmissionResponse(SubmissionResponse.Terminated value) =>
        new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<SubmissionResponse>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(SubmissionResponse).IsAssignableFrom(typeToConvert);

        public override SubmissionResponse Read(
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
                "serverInitialized" => new { },
                "problemInitialized" => json.GetProperty("value").Deserialize<string?>(options)
                ?? throw new JsonException("Failed to deserialize string"),
                "workspaceInitialized" => new { },
                "serverErrored" => json.Deserialize<SeedTrace.ExceptionInfo?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.ExceptionInfo"),
                "codeExecutionUpdate" => json.GetProperty("value")
                    .Deserialize<SeedTrace.CodeExecutionUpdate?>(options)
                ?? throw new JsonException("Failed to deserialize SeedTrace.CodeExecutionUpdate"),
                "terminated" => json.Deserialize<SeedTrace.TerminatedResponse?>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.TerminatedResponse"
                    ),
                _ => json.Deserialize<object?>(options),
            };
            return new SubmissionResponse(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            SubmissionResponse value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "serverInitialized" => null,
                    "problemInitialized" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "workspaceInitialized" => null,
                    "serverErrored" => JsonSerializer.SerializeToNode(value.Value, options),
                    "codeExecutionUpdate" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "terminated" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for serverInitialized
    /// </summary>
    [Serializable]
    public record ServerInitialized
    {
        internal object Value => new { };

        public override string ToString() => Value.ToString() ?? "null";
    }

    /// <summary>
    /// Discriminated union type for problemInitialized
    /// </summary>
    [Serializable]
    public record ProblemInitialized
    {
        public ProblemInitialized(string value)
        {
            Value = value;
        }

        internal string Value { get; set; }

        public override string ToString() => Value;

        public static implicit operator SubmissionResponse.ProblemInitialized(string value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for workspaceInitialized
    /// </summary>
    [Serializable]
    public record WorkspaceInitialized
    {
        internal object Value => new { };

        public override string ToString() => Value.ToString() ?? "null";
    }

    /// <summary>
    /// Discriminated union type for serverErrored
    /// </summary>
    [Serializable]
    public struct ServerErrored
    {
        public ServerErrored(SeedTrace.ExceptionInfo value)
        {
            Value = value;
        }

        internal SeedTrace.ExceptionInfo Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator SubmissionResponse.ServerErrored(
            SeedTrace.ExceptionInfo value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for codeExecutionUpdate
    /// </summary>
    [Serializable]
    public struct CodeExecutionUpdate
    {
        public CodeExecutionUpdate(SeedTrace.CodeExecutionUpdate value)
        {
            Value = value;
        }

        internal SeedTrace.CodeExecutionUpdate Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator SubmissionResponse.CodeExecutionUpdate(
            SeedTrace.CodeExecutionUpdate value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for terminated
    /// </summary>
    [Serializable]
    public struct Terminated
    {
        public Terminated(SeedTrace.TerminatedResponse value)
        {
            Value = value;
        }

        internal SeedTrace.TerminatedResponse Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator SubmissionResponse.Terminated(
            SeedTrace.TerminatedResponse value
        ) => new(value);
    }
}
