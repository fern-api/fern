using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class TestSubmissionState
{
    [JsonPropertyName("problemId")]
    public string ProblemId { get; init; }

    [JsonPropertyName("defaultTestCases")]
    public List<TestCase> DefaultTestCases { get; init; }

    [JsonPropertyName("customTestCases")]
    public List<TestCase> CustomTestCases { get; init; }

    [JsonPropertyName("status")]
    public TestSubmissionStatus Status { get; init; }
}
