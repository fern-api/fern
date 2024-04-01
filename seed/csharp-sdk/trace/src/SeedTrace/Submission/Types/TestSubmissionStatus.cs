using System.Text.Json.Serialization;
using OneOf;
using SeedTrace;
using StringEnum;

namespace SeedTrace;

public class TestSubmissionStatus
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
    public class _TestCaseIdToState
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "testCaseIdToState";

        [JsonPropertyName("value")]
        public Dictionary<string, OneOf<SubmissionStatusForTestCase._Graded, SubmissionStatusForTestCase._GradedV2, SubmissionStatusForTestCase._Traced>> Value { get; init; }
    }
}
