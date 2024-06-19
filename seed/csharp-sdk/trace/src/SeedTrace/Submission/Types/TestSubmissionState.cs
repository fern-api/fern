using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public class TestSubmissionState
{
    [JsonPropertyName("problemId")]
    public string ProblemId { get; init; }

    [JsonPropertyName("defaultTestCases")]
    public IEnumerable<TestCase> DefaultTestCases { get; init; }

    [JsonPropertyName("customTestCases")]
    public IEnumerable<TestCase> CustomTestCases { get; init; }

    [JsonPropertyName("status")]
    public TestSubmissionStatus Status { get; init; }
}
