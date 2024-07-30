using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record WorkspaceSubmissionState
{
    [JsonPropertyName("status")]
    public required object Status { get; set; }
}
