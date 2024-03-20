using SeedTraceClient
using System.Text.Json.Serialization

namespace SeedTraceClient

public class SubmissionTypeState
{
    public class _TestSubmissionState : TestSubmissionState
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "test";
    }
    public class _WorkspaceSubmissionState : WorkspaceSubmissionState
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "workspace";
    }
}
