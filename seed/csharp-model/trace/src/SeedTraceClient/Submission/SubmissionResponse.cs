using System.Text.Json.Serialization
using SeedTraceClient
using OneOf

namespace SeedTraceClient

public class SubmissionResponse
{
    public class _ServerInitialized
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "serverInitialized";
    }
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "problemInitialized";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    public class _WorkspaceInitialized
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "workspaceInitialized";
    }
    public class _ExceptionInfo : ExceptionInfo
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "serverErrored";
    }
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "codeExecutionUpdate";

        [JsonPropertyName("value")]
        public OneOf<BuildingExecutorResponse, RunningResponse, ErroredResponse, StoppedResponse, GradedResponse, GradedResponseV2, WorkspaceRanResponse, RecordingResponseNotification, RecordedResponseNotification, InvalidRequestResponse, FinishedResponse> Value { get; init; }
    }
    public class _TerminatedResponse : TerminatedResponse
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "terminated";
    }
}
