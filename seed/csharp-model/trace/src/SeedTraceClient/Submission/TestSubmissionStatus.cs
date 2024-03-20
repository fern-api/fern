using System.Text.Json.Serialization
using OneOf
using SeedTraceClient
using StringEnum

namespace SeedTraceClient

public class TestSubmissionStatus
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
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "testCaseIdToState";

        [JsonPropertyName("value")]
        public Dictionary<string, OneOf<TestCaseResultWithStdout, Value, TracedTestCase>> Value { get; init; }
    }
}
