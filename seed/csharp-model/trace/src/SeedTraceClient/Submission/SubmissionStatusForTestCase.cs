using SeedTraceClient
using System.Text.Json.Serialization
using OneOf

namespace SeedTraceClient

public class SubmissionStatusForTestCase
{
    public class _TestCaseResultWithStdout : TestCaseResultWithStdout
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "graded";
    }
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "gradedV2";

        [JsonPropertyName("value")]
        public OneOf<TestCaseHiddenGrade, TestCaseNonHiddenGrade> Value { get; init; }
    }
    public class _TracedTestCase : TracedTestCase
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "traced";
    }
}
