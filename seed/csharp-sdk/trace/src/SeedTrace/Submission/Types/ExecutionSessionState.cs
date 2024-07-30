using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record ExecutionSessionState
{
    [JsonPropertyName("lastTimeContacted")]
    public string? LastTimeContacted { get; }

    /// <summary>
    /// The auto-generated session id. Formatted as a uuid.
    /// </summary>
    [JsonPropertyName("sessionId")]
    public required string SessionId { get; }

    [JsonPropertyName("isWarmInstance")]
    public required bool IsWarmInstance { get; }

    [JsonPropertyName("awsTaskId")]
    public string? AwsTaskId { get; }

    [JsonPropertyName("language")]
    public required Language Language { get; }

    [JsonPropertyName("status")]
    public required ExecutionSessionStatus Status { get; }
}
