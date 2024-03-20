using System.Text.Json.Serialization
using StringEnum
using SeedTraceClient
using OneOf

namespace SeedTraceClient

public class TestSubmissionUpdateInfo
{
    public class _Value
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
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "errored";

        [JsonPropertyName("value")]
        public OneOf<CompileError, RuntimeError, InternalError> Value { get; init; }
    }
    public class _GradedTestCaseUpdate : GradedTestCaseUpdate
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "gradedTestCase";
    }
    public class _RecordedTestCaseUpdate : RecordedTestCaseUpdate
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
