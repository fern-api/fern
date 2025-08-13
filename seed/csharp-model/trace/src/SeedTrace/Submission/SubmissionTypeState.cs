// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(JsonConverter))]
[Serializable]
public record SubmissionTypeState
{
    internal SubmissionTypeState(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of SubmissionTypeState with <see cref="Test"/>.
    /// </summary>
    public SubmissionTypeState(Test value)
    {
        Type = "test";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of SubmissionTypeState with <see cref="Workspace"/>.
    /// </summary>
    public SubmissionTypeState(Workspace value)
    {
        Type = "workspace";
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
    /// Returns true if <see cref="Type"/> is "test"
    /// </summary>
    public bool IsTest => Type == "test";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "workspace"
    /// </summary>
    public bool IsWorkspace => Type == "workspace";

    /// <summary>
    /// Returns the value as a <see cref="TestSubmissionState"/> if <see cref="Type"/> is 'test', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'test'.</exception>
    public TestSubmissionState AsTest() =>
        IsTest
            ? (TestSubmissionState)Value!
            : throw new Exception("SeedTrace.SubmissionTypeState.Type is not 'test'");

    /// <summary>
    /// Returns the value as a <see cref="WorkspaceSubmissionState"/> if <see cref="Type"/> is 'workspace', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'workspace'.</exception>
    public WorkspaceSubmissionState AsWorkspace() =>
        IsWorkspace
            ? (WorkspaceSubmissionState)Value!
            : throw new Exception("SeedTrace.SubmissionTypeState.Type is not 'workspace'");

    public T Match<T>(
        Func<TestSubmissionState, T> onTest,
        Func<WorkspaceSubmissionState, T> onWorkspace,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "test" => onTest(AsTest()),
            "workspace" => onWorkspace(AsWorkspace()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<TestSubmissionState> onTest,
        Action<WorkspaceSubmissionState> onWorkspace,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "test":
                onTest(AsTest());
                break;
            case "workspace":
                onWorkspace(AsWorkspace());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="TestSubmissionState"/> and returns true if successful.
    /// </summary>
    public bool TryAsTest(out TestSubmissionState? value)
    {
        if (Type == "test")
        {
            value = (TestSubmissionState)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="WorkspaceSubmissionState"/> and returns true if successful.
    /// </summary>
    public bool TryAsWorkspace(out WorkspaceSubmissionState? value)
    {
        if (Type == "workspace")
        {
            value = (WorkspaceSubmissionState)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator SubmissionTypeState(Test value) => new(value);

    public static implicit operator SubmissionTypeState(Workspace value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<SubmissionTypeState>
    {
        public override bool CanConvert(Type typeToConvert) =>
            typeof(SubmissionTypeState).IsAssignableFrom(typeToConvert);

        public override SubmissionTypeState Read(
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
                "test" => json.Deserialize<TestSubmissionState>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.TestSubmissionState"
                    ),
                "workspace" => json.Deserialize<WorkspaceSubmissionState>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.WorkspaceSubmissionState"
                    ),
                _ => json.Deserialize<object?>(options),
            };
            return new SubmissionTypeState(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            SubmissionTypeState value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "test" => JsonSerializer.SerializeToNode(value.Value, options),
                    "workspace" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for test
    /// </summary>
    [Serializable]
    public struct Test
    {
        public Test(TestSubmissionState value)
        {
            Value = value;
        }

        internal TestSubmissionState Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator Test(TestSubmissionState value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for workspace
    /// </summary>
    [Serializable]
    public struct Workspace
    {
        public Workspace(WorkspaceSubmissionState value)
        {
            Value = value;
        }

        internal WorkspaceSubmissionState Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator Workspace(WorkspaceSubmissionState value) => new(value);
    }
}
