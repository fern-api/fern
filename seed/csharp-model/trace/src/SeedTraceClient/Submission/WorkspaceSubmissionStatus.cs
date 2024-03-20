using System.Text.Json.Serialization
using OneOf
using SeedTraceClient
using StringEnum

namespace SeedTraceClient

public class WorkspaceSubmissionStatus
{
    public class _Stopped
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "stopped";
    }
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "errored";

        [JsonPropertyName("value")]
        public OneOf<CompileError, RuntimeError, InternalError> Value { get; init; }
    }
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "running";

        [JsonPropertyName("value")]
        public StringEnum<RunningSubmissionState> Value { get; init; }
    }
    public class _WorkspaceRunDetails : WorkspaceRunDetails
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "ran";
    }
    public class _WorkspaceRunDetails : WorkspaceRunDetails
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "traced";
    }
}
