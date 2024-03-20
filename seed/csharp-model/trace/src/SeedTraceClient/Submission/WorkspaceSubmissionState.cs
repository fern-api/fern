using System.Text.Json.Serialization
using OneOf
using SeedTraceClient

namespace SeedTraceClient

public class WorkspaceSubmissionState
{
    [JsonPropertyName("status")]
    public OneOf<Stopped, Value, Value, WorkspaceRunDetails, WorkspaceRunDetails> Status { get; init; }
}
