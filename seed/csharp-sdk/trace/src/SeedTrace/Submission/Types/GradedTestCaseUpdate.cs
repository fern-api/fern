using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class GradedTestCaseUpdate
{
    [JsonPropertyName("testCaseId")]
    public string TestCaseId { get; init; }

    [JsonPropertyName("grade")]
    public object Grade { get; init; }
}
