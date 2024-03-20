using System.Text.Json.Serialization
using OneOf
using SeedTraceClient

namespace SeedTraceClient

public class GradedTestCaseUpdate
{
    [JsonPropertyName("testCaseId")]
    public string TestCaseId { get; init; }

    [JsonPropertyName("grade")]
    public OneOf<TestCaseHiddenGrade, TestCaseNonHiddenGrade> Grade { get; init; }
}
