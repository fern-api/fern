using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class WorkspaceSubmissionUpdate
{
    [JsonPropertyName("updateTime")]
    public DateTime UpdateTime { get; init; }

    [JsonPropertyName("updateInfo")]
    public object UpdateInfo { get; init; }
}
