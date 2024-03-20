using SeedTraceClient
using System.Text.Json.Serialization

namespace SeedTraceClient

public class SubmissionRequest
{
    public class _InitializeProblemRequest : InitializeProblemRequest
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "initializeProblemRequest";
    }
    public class _InitializeWorkspaceRequest
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "initializeWorkspaceRequest";
    }
    public class _SubmitRequestV2 : SubmitRequestV2
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "submitV2";
    }
    public class _WorkspaceSubmitRequest : WorkspaceSubmitRequest
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "workspaceSubmit";
    }
    public class _StopRequest : StopRequest
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "stop";
    }
}
