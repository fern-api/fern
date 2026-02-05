// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(SubmissionStatusV2.JsonConverter))]
[Serializable]
public record SubmissionStatusV2
{
    internal SubmissionStatusV2(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of SubmissionStatusV2 with <see cref="SubmissionStatusV2.Test"/>.
    /// </summary>
    public SubmissionStatusV2(SubmissionStatusV2.Test value)
    {
        Type = "test";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of SubmissionStatusV2 with <see cref="SubmissionStatusV2.Workspace"/>.
    /// </summary>
    public SubmissionStatusV2(SubmissionStatusV2.Workspace value)
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
    /// Returns the value as a <see cref="SeedTrace.TestSubmissionStatusV2"/> if <see cref="Type"/> is 'test', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'test'.</exception>
    public SeedTrace.TestSubmissionStatusV2 AsTest() =>
        IsTest
            ? (SeedTrace.TestSubmissionStatusV2)Value!
            : throw new System.Exception("SubmissionStatusV2.Type is not 'test'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.WorkspaceSubmissionStatusV2"/> if <see cref="Type"/> is 'workspace', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'workspace'.</exception>
    public SeedTrace.WorkspaceSubmissionStatusV2 AsWorkspace() =>
        IsWorkspace
            ? (SeedTrace.WorkspaceSubmissionStatusV2)Value!
            : throw new System.Exception("SubmissionStatusV2.Type is not 'workspace'");

    public T Match<T>(
        Func<SeedTrace.TestSubmissionStatusV2, T> onTest,
        Func<SeedTrace.WorkspaceSubmissionStatusV2, T> onWorkspace,
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
        Action<SeedTrace.TestSubmissionStatusV2> onTest,
        Action<SeedTrace.WorkspaceSubmissionStatusV2> onWorkspace,
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
    /// Attempts to cast the value to a <see cref="SeedTrace.TestSubmissionStatusV2"/> and returns true if successful.
    /// </summary>
    public bool TryAsTest(out SeedTrace.TestSubmissionStatusV2? value)
    {
        if (Type == "test")
        {
            value = (SeedTrace.TestSubmissionStatusV2)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.WorkspaceSubmissionStatusV2"/> and returns true if successful.
    /// </summary>
    public bool TryAsWorkspace(out SeedTrace.WorkspaceSubmissionStatusV2? value)
    {
        if (Type == "workspace")
        {
            value = (SeedTrace.WorkspaceSubmissionStatusV2)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator SubmissionStatusV2(SubmissionStatusV2.Test value) => new(value);

    public static implicit operator SubmissionStatusV2(SubmissionStatusV2.Workspace value) =>
        new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<SubmissionStatusV2>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(SubmissionStatusV2).IsAssignableFrom(typeToConvert);

        public override SubmissionStatusV2 Read(
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
                "test" => json.Deserialize<SeedTrace.TestSubmissionStatusV2?>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.TestSubmissionStatusV2"
                    ),
                "workspace" => json.Deserialize<SeedTrace.WorkspaceSubmissionStatusV2?>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.WorkspaceSubmissionStatusV2"
                    ),
                _ => json.Deserialize<object?>(options),
            };
            return new SubmissionStatusV2(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            SubmissionStatusV2 value,
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
        public Test(SeedTrace.TestSubmissionStatusV2 value)
        {
            Value = value;
        }

        internal SeedTrace.TestSubmissionStatusV2 Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator SubmissionStatusV2.Test(
            SeedTrace.TestSubmissionStatusV2 value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for workspace
    /// </summary>
    [Serializable]
    public struct Workspace
    {
        public Workspace(SeedTrace.WorkspaceSubmissionStatusV2 value)
        {
            Value = value;
        }

        internal SeedTrace.WorkspaceSubmissionStatusV2 Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator SubmissionStatusV2.Workspace(
            SeedTrace.WorkspaceSubmissionStatusV2 value
        ) => new(value);
    }
}
