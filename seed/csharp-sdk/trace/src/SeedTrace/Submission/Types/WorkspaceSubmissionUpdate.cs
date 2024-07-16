using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record WorkspaceSubmissionUpdate
{
    [JsonPropertyName("updateTime")]
    public required DateTime UpdateTime { get; init; }

    [JsonPropertyName("updateInfo")]
    public required object UpdateInfo { get; init; }
}
