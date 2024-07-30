using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record TestSubmissionState
{
    [JsonPropertyName("problemId")]
    public required string ProblemId { get; }

    [JsonPropertyName("defaultTestCases")]
    public IEnumerable<TestCase> DefaultTestCases { get; } = new List<TestCase>();

    [JsonPropertyName("customTestCases")]
    public IEnumerable<TestCase> CustomTestCases { get; } = new List<TestCase>();

    [JsonPropertyName("status")]
    public required object Status { get; }
}
