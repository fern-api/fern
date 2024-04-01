using Client;
using System.Text.Json.Serialization;
using OneOf;

namespace Client;

public class SubmissionStatusForTestCase
{
    public class _Graded : TestCaseResultWithStdout
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "graded";
    }
    public class _GradedV2
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "gradedV2";

        [JsonPropertyName("value")]
        public OneOf<TestCaseGrade._Hidden, TestCaseGrade._NonHidden> Value { get; init; }
    }
    public class _Traced : TracedTestCase
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "traced";
    }
}
