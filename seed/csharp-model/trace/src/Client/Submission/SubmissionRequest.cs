using Client;
using System.Text.Json.Serialization;

namespace Client;

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
    public class _SubmitV2 : SubmitRequestV2
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "submitV2";
    }
    public class _WorkspaceSubmit : WorkspaceSubmitRequest
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "workspaceSubmit";
    }
    public class _Stop : StopRequest
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "stop";
    }
}
