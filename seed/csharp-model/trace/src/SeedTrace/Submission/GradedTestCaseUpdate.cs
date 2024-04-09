using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class GradedTestCaseUpdate
{
    [JsonPropertyName("testCaseId")]
    public string TestCaseId { get; init; }

    [JsonPropertyName("grade")]
    public TestCaseGrade Grade { get; init; }
}
