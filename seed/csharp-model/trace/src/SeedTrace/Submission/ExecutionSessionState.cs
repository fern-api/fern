using System.Text.Json.Serialization;
using SeedTrace;

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

    [JsonPropertyName("language")]
    public Language Language { get; init; }

    [JsonPropertyName("status")]
    public ExecutionSessionStatus Status { get; init; }
}
