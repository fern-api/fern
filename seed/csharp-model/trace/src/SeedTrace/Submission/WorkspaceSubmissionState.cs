using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class WorkspaceSubmissionState
{
    [JsonPropertyName("status")]
    public object Status { get; init; }
}
