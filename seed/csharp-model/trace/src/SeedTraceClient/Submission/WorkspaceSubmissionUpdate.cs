using System.Text.Json.Serialization
using OneOf
using SeedTraceClient

namespace SeedTraceClient

public class WorkspaceSubmissionUpdate
{
    [JsonPropertyName("updateTime")]
    public DateTime UpdateTime { get; init; }

    [JsonPropertyName("updateInfo")]
    public OneOf<Value, WorkspaceRunDetails, Stopped, Traced, WorkspaceTracedUpdate, Value, Finished> UpdateInfo { get; init; }
}
