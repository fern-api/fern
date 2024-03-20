using System.Text.Json.Serialization
using StringEnum
using SeedTraceClient
using OneOf

namespace SeedTraceClient

public class WorkspaceSubmissionUpdateInfo
{
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
    public class _Stopped
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "stopped";
    }
    public class _Traced
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "traced";
    }
    public class _WorkspaceTracedUpdate : WorkspaceTracedUpdate
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "tracedV2";
    }
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "errored";

        [JsonPropertyName("value")]
        public OneOf<CompileError, RuntimeError, InternalError> Value { get; init; }
    }
    public class _Finished
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "finished";
    }
}
