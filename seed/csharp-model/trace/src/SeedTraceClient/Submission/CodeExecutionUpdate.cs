using SeedTraceClient;
using System.Text.Json.Serialization;

namespace SeedTraceClient;

public class CodeExecutionUpdate
{
    public class _BuildingExecutor : BuildingExecutorResponse
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "buildingExecutor";
    }
    public class _Running : RunningResponse
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "running";
    }
    public class _Errored : ErroredResponse
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "errored";
    }
    public class _Stopped : StoppedResponse
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "stopped";
    }
    public class _Graded : GradedResponse
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "graded";
    }
    public class _GradedV2 : GradedResponseV2
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "gradedV2";
    }
    public class _WorkspaceRan : WorkspaceRanResponse
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "workspaceRan";
    }
    public class _Recording : RecordingResponseNotification
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "recording";
    }
    public class _Recorded : RecordedResponseNotification
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "recorded";
    }
    public class _InvalidRequest : InvalidRequestResponse
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "invalidRequest";
    }
    public class _Finished : FinishedResponse
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "finished";
    }
}
