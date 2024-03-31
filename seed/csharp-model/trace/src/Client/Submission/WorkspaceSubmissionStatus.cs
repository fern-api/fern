using System.Text.Json.Serialization;
using OneOf;
using Client;
using StringEnum;

namespace Client;

public class WorkspaceSubmissionStatus
{
    public class _Stopped
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "stopped";
    }
    public class _Errored
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "errored";

        [JsonPropertyName("value")]
        public OneOf<ErrorInfo._CompileError, ErrorInfo._RuntimeError, ErrorInfo._InternalError> Value { get; init; }
    }
    public class _Running
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "running";

        [JsonPropertyName("value")]
        public StringEnum<RunningSubmissionState> Value { get; init; }
    }
    public class _Ran : WorkspaceRunDetails
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "ran";
    }
    public class _Traced : WorkspaceRunDetails
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "traced";
    }
}
