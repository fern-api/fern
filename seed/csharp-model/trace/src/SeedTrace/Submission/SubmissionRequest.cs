// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(SubmissionRequest.JsonConverter))]
[Serializable]
public record SubmissionRequest
{
    internal SubmissionRequest(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of SubmissionRequest with <see cref="SubmissionRequest.InitializeProblemRequest"/>.
    /// </summary>
    public SubmissionRequest(SubmissionRequest.InitializeProblemRequest value)
    {
        Type = "initializeProblemRequest";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of SubmissionRequest with <see cref="SubmissionRequest.InitializeWorkspaceRequest"/>.
    /// </summary>
    public SubmissionRequest(SubmissionRequest.InitializeWorkspaceRequest value)
    {
        Type = "initializeWorkspaceRequest";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of SubmissionRequest with <see cref="SubmissionRequest.SubmitV2"/>.
    /// </summary>
    public SubmissionRequest(SubmissionRequest.SubmitV2 value)
    {
        Type = "submitV2";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of SubmissionRequest with <see cref="SubmissionRequest.WorkspaceSubmit"/>.
    /// </summary>
    public SubmissionRequest(SubmissionRequest.WorkspaceSubmit value)
    {
        Type = "workspaceSubmit";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of SubmissionRequest with <see cref="SubmissionRequest.Stop"/>.
    /// </summary>
    public SubmissionRequest(SubmissionRequest.Stop value)
    {
        Type = "stop";
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
    /// Returns true if <see cref="Type"/> is "initializeProblemRequest"
    /// </summary>
    public bool IsInitializeProblemRequest => Type == "initializeProblemRequest";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "initializeWorkspaceRequest"
    /// </summary>
    public bool IsInitializeWorkspaceRequest => Type == "initializeWorkspaceRequest";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "submitV2"
    /// </summary>
    public bool IsSubmitV2 => Type == "submitV2";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "workspaceSubmit"
    /// </summary>
    public bool IsWorkspaceSubmit => Type == "workspaceSubmit";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "stop"
    /// </summary>
    public bool IsStop => Type == "stop";

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.InitializeProblemRequest"/> if <see cref="Type"/> is 'initializeProblemRequest', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'initializeProblemRequest'.</exception>
    public SeedTrace.InitializeProblemRequest AsInitializeProblemRequest() =>
        IsInitializeProblemRequest
            ? (SeedTrace.InitializeProblemRequest)Value!
            : throw new System.Exception(
                "SubmissionRequest.Type is not 'initializeProblemRequest'"
            );

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'initializeWorkspaceRequest', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'initializeWorkspaceRequest'.</exception>
    public object AsInitializeWorkspaceRequest() =>
        IsInitializeWorkspaceRequest
            ? Value!
            : throw new System.Exception(
                "SubmissionRequest.Type is not 'initializeWorkspaceRequest'"
            );

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.SubmitRequestV2"/> if <see cref="Type"/> is 'submitV2', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'submitV2'.</exception>
    public SeedTrace.SubmitRequestV2 AsSubmitV2() =>
        IsSubmitV2
            ? (SeedTrace.SubmitRequestV2)Value!
            : throw new System.Exception("SubmissionRequest.Type is not 'submitV2'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.WorkspaceSubmitRequest"/> if <see cref="Type"/> is 'workspaceSubmit', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'workspaceSubmit'.</exception>
    public SeedTrace.WorkspaceSubmitRequest AsWorkspaceSubmit() =>
        IsWorkspaceSubmit
            ? (SeedTrace.WorkspaceSubmitRequest)Value!
            : throw new System.Exception("SubmissionRequest.Type is not 'workspaceSubmit'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.StopRequest"/> if <see cref="Type"/> is 'stop', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'stop'.</exception>
    public SeedTrace.StopRequest AsStop() =>
        IsStop
            ? (SeedTrace.StopRequest)Value!
            : throw new System.Exception("SubmissionRequest.Type is not 'stop'");

    public T Match<T>(
        Func<SeedTrace.InitializeProblemRequest, T> onInitializeProblemRequest,
        Func<object, T> onInitializeWorkspaceRequest,
        Func<SeedTrace.SubmitRequestV2, T> onSubmitV2,
        Func<SeedTrace.WorkspaceSubmitRequest, T> onWorkspaceSubmit,
        Func<SeedTrace.StopRequest, T> onStop,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "initializeProblemRequest" => onInitializeProblemRequest(AsInitializeProblemRequest()),
            "initializeWorkspaceRequest" => onInitializeWorkspaceRequest(
                AsInitializeWorkspaceRequest()
            ),
            "submitV2" => onSubmitV2(AsSubmitV2()),
            "workspaceSubmit" => onWorkspaceSubmit(AsWorkspaceSubmit()),
            "stop" => onStop(AsStop()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedTrace.InitializeProblemRequest> onInitializeProblemRequest,
        Action<object> onInitializeWorkspaceRequest,
        Action<SeedTrace.SubmitRequestV2> onSubmitV2,
        Action<SeedTrace.WorkspaceSubmitRequest> onWorkspaceSubmit,
        Action<SeedTrace.StopRequest> onStop,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "initializeProblemRequest":
                onInitializeProblemRequest(AsInitializeProblemRequest());
                break;
            case "initializeWorkspaceRequest":
                onInitializeWorkspaceRequest(AsInitializeWorkspaceRequest());
                break;
            case "submitV2":
                onSubmitV2(AsSubmitV2());
                break;
            case "workspaceSubmit":
                onWorkspaceSubmit(AsWorkspaceSubmit());
                break;
            case "stop":
                onStop(AsStop());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.InitializeProblemRequest"/> and returns true if successful.
    /// </summary>
    public bool TryAsInitializeProblemRequest(out SeedTrace.InitializeProblemRequest? value)
    {
        if (Type == "initializeProblemRequest")
        {
            value = (SeedTrace.InitializeProblemRequest)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="object"/> and returns true if successful.
    /// </summary>
    public bool TryAsInitializeWorkspaceRequest(out object? value)
    {
        if (Type == "initializeWorkspaceRequest")
        {
            value = Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.SubmitRequestV2"/> and returns true if successful.
    /// </summary>
    public bool TryAsSubmitV2(out SeedTrace.SubmitRequestV2? value)
    {
        if (Type == "submitV2")
        {
            value = (SeedTrace.SubmitRequestV2)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.WorkspaceSubmitRequest"/> and returns true if successful.
    /// </summary>
    public bool TryAsWorkspaceSubmit(out SeedTrace.WorkspaceSubmitRequest? value)
    {
        if (Type == "workspaceSubmit")
        {
            value = (SeedTrace.WorkspaceSubmitRequest)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.StopRequest"/> and returns true if successful.
    /// </summary>
    public bool TryAsStop(out SeedTrace.StopRequest? value)
    {
        if (Type == "stop")
        {
            value = (SeedTrace.StopRequest)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator SubmissionRequest(
        SubmissionRequest.InitializeProblemRequest value
    ) => new(value);

    public static implicit operator SubmissionRequest(SubmissionRequest.SubmitV2 value) =>
        new(value);

    public static implicit operator SubmissionRequest(SubmissionRequest.WorkspaceSubmit value) =>
        new(value);

    public static implicit operator SubmissionRequest(SubmissionRequest.Stop value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<SubmissionRequest>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(SubmissionRequest).IsAssignableFrom(typeToConvert);

        public override SubmissionRequest Read(
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
                "initializeProblemRequest" => json.Deserialize<SeedTrace.InitializeProblemRequest?>(
                    options
                )
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.InitializeProblemRequest"
                    ),
                "initializeWorkspaceRequest" => new { },
                "submitV2" => json.Deserialize<SeedTrace.SubmitRequestV2?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.SubmitRequestV2"),
                "workspaceSubmit" => json.Deserialize<SeedTrace.WorkspaceSubmitRequest?>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.WorkspaceSubmitRequest"
                    ),
                "stop" => json.Deserialize<SeedTrace.StopRequest?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.StopRequest"),
                _ => json.Deserialize<object?>(options),
            };
            return new SubmissionRequest(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            SubmissionRequest value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "initializeProblemRequest" => JsonSerializer.SerializeToNode(
                        value.Value,
                        options
                    ),
                    "initializeWorkspaceRequest" => null,
                    "submitV2" => JsonSerializer.SerializeToNode(value.Value, options),
                    "workspaceSubmit" => JsonSerializer.SerializeToNode(value.Value, options),
                    "stop" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for initializeProblemRequest
    /// </summary>
    [Serializable]
    public struct InitializeProblemRequest
    {
        public InitializeProblemRequest(SeedTrace.InitializeProblemRequest value)
        {
            Value = value;
        }

        internal SeedTrace.InitializeProblemRequest Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator SubmissionRequest.InitializeProblemRequest(
            SeedTrace.InitializeProblemRequest value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for initializeWorkspaceRequest
    /// </summary>
    [Serializable]
    public record InitializeWorkspaceRequest
    {
        internal object Value => new { };

        public override string ToString() => Value.ToString() ?? "null";
    }

    /// <summary>
    /// Discriminated union type for submitV2
    /// </summary>
    [Serializable]
    public struct SubmitV2
    {
        public SubmitV2(SeedTrace.SubmitRequestV2 value)
        {
            Value = value;
        }

        internal SeedTrace.SubmitRequestV2 Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator SubmissionRequest.SubmitV2(
            SeedTrace.SubmitRequestV2 value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for workspaceSubmit
    /// </summary>
    [Serializable]
    public struct WorkspaceSubmit
    {
        public WorkspaceSubmit(SeedTrace.WorkspaceSubmitRequest value)
        {
            Value = value;
        }

        internal SeedTrace.WorkspaceSubmitRequest Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator SubmissionRequest.WorkspaceSubmit(
            SeedTrace.WorkspaceSubmitRequest value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for stop
    /// </summary>
    [Serializable]
    public struct Stop
    {
        public Stop(SeedTrace.StopRequest value)
        {
            Value = value;
        }

        internal SeedTrace.StopRequest Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator SubmissionRequest.Stop(SeedTrace.StopRequest value) =>
            new(value);
    }
}
