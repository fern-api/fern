using SeedTraceClient
using System.Text.Json.Serialization

namespace SeedTraceClient

public class SubmissionStatusV2
{
    public class _TestSubmissionStatusV2 : TestSubmissionStatusV2
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "test";
    }
    public class _WorkspaceSubmissionStatusV2 : WorkspaceSubmissionStatusV2
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "workspace";
    }
}
