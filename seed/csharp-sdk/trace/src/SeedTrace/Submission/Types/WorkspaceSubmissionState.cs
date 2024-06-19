using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public class WorkspaceSubmissionState
{
    [JsonPropertyName("status")]
    public WorkspaceSubmissionStatus Status { get; init; }
}
