using SeedTrace;
using System.Text.Json.Serialization;

namespace SeedTrace;

public class SubmissionStatusV2
{
    public class _Test : TestSubmissionStatusV2
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "test";
    }
    public class _Workspace : WorkspaceSubmissionStatusV2
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "workspace";
    }
}
