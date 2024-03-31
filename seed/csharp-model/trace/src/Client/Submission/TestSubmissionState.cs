using System.Text.Json.Serialization;
using Client;
using OneOf;

namespace Client;

public class TestSubmissionState
{
    [JsonPropertyName("problemId")]
    public string ProblemId { get; init; }

    [JsonPropertyName("defaultTestCases")]
    public List<TestCase> DefaultTestCases { get; init; }

    [JsonPropertyName("customTestCases")]
    public List<TestCase> CustomTestCases { get; init; }

    [JsonPropertyName("status")]
    public OneOf<TestSubmissionStatus._Stopped, TestSubmissionStatus._Errored, TestSubmissionStatus._Running, TestSubmissionStatus._TestCaseIdToState> Status { get; init; }
}
