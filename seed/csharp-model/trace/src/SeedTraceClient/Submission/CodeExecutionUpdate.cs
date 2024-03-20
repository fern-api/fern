using SeedTraceClient
using System.Text.Json.Serialization

namespace SeedTraceClient

public class CodeExecutionUpdate
{
    public class _BuildingExecutorResponse : BuildingExecutorResponse
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "buildingExecutor";
    }
    public class _RunningResponse : RunningResponse
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "running";
    }
    public class _ErroredResponse : ErroredResponse
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "errored";
    }
    public class _StoppedResponse : StoppedResponse
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "stopped";
    }
    public class _GradedResponse : GradedResponse
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "graded";
    }
    public class _GradedResponseV2 : GradedResponseV2
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "gradedV2";
    }
    public class _WorkspaceRanResponse : WorkspaceRanResponse
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "workspaceRan";
    }
    public class _RecordingResponseNotification : RecordingResponseNotification
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "recording";
    }
    public class _RecordedResponseNotification : RecordedResponseNotification
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "recorded";
    }
    public class _InvalidRequestResponse : InvalidRequestResponse
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "invalidRequest";
    }
    public class _FinishedResponse : FinishedResponse
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "finished";
    }
}
