using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class WorkspaceSubmissionState
{
    [JsonPropertyName("status")]
    public WorkspaceSubmissionStatus Status { get; init; }
}
