using System.Text.Json.Serialization;
using StringEnum;
using SeedTrace;
using OneOf;

namespace SeedTrace;

public class TestSubmissionUpdateInfo
{
    public class _Running
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "running";

        [JsonPropertyName("value")]
        public StringEnum<RunningSubmissionState> Value { get; init; }
    }
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
    public class _GradedTestCase : GradedTestCaseUpdate
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "gradedTestCase";
    }
    public class _RecordedTestCase : RecordedTestCaseUpdate
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "recordedTestCase";
    }
    public class _Finished
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "finished";
    }
}
