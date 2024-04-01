using System.Text.Json.Serialization;
using OneOf;
using SeedTrace;

namespace SeedTrace;

public class WorkspaceSubmissionUpdate
{
    [JsonPropertyName("updateTime")]
    public DateTime UpdateTime { get; init; }

    [JsonPropertyName("updateInfo")]
    public OneOf<WorkspaceSubmissionUpdateInfo._Running, WorkspaceSubmissionUpdateInfo._Ran, WorkspaceSubmissionUpdateInfo._Stopped, WorkspaceSubmissionUpdateInfo._Traced, WorkspaceSubmissionUpdateInfo._TracedV2, WorkspaceSubmissionUpdateInfo._Errored, WorkspaceSubmissionUpdateInfo._Finished> UpdateInfo { get; init; }
}
