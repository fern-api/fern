using System.Text.Json.Serialization;
using OneOf;
using SeedTrace;

namespace SeedTrace;

public class WorkspaceSubmissionState
{
    [JsonPropertyName("status")]
    public OneOf<WorkspaceSubmissionStatus._Stopped, WorkspaceSubmissionStatus._Errored, WorkspaceSubmissionStatus._Running, WorkspaceSubmissionStatus._Ran, WorkspaceSubmissionStatus._Traced> Status { get; init; }
}
