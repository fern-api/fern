using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class WorkspaceSubmissionUpdate
{
    [JsonPropertyName("updateTime")]
    public DateTime UpdateTime { get; init; }

    [JsonPropertyName("updateInfo")]
    public WorkspaceSubmissionUpdateInfo UpdateInfo { get; init; }
}
