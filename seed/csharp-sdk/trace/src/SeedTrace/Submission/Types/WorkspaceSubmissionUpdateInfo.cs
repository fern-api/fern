using System.Text.Json.Serialization;
using SeedTrace;
using OneOf;

namespace SeedTrace;

public class WorkspaceSubmissionUpdateInfo
{
    public class _Running
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "running";

        [JsonPropertyName("value")]
        public RunningSubmissionState Value { get; init; }
    }
    public class _Ran : WorkspaceRunDetails
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
    public class _TracedV2 : WorkspaceTracedUpdate
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "tracedV2";
    }
    public class _Errored
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "errored";

        [JsonPropertyName("value")]
        public OneOf<ErrorInfo._CompileError, ErrorInfo._RuntimeError, ErrorInfo._InternalError> Value { get; init; }
    }
    public class _Finished
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "finished";
    }
}
