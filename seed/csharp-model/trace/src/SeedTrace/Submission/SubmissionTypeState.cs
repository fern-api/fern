using SeedTrace;
using System.Text.Json.Serialization;

namespace SeedTrace;

public class SubmissionTypeState
{
    public class _Test : TestSubmissionState
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "test";
    }
    public class _Workspace : WorkspaceSubmissionState
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "workspace";
    }
}
