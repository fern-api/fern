using System.Text.Json.Serialization;
using SeedTrace.Core;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public class ExecutionSessionState
{
    [JsonPropertyName("lastTimeContacted")]
    public string? LastTimeContacted { get; init; }

    /// <summary>
    /// The auto-generated session id. Formatted as a uuid.
    /// </summary>
    [JsonPropertyName("sessionId")]
    public string SessionId { get; init; }

    [JsonPropertyName("isWarmInstance")]
    public bool IsWarmInstance { get; init; }

    [JsonPropertyName("awsTaskId")]
    public string? AwsTaskId { get; init; }

    [JsonPropertyName("language")JsonConverter(typeof(StringEnumSerializer;
    <Language;
    >))]
    public Language Language { get; init; }

    [JsonPropertyName("status")JsonConverter(typeof(StringEnumSerializer;
    <ExecutionSessionStatus;
    >))]
    public ExecutionSessionStatus Status { get; init; }
}
