using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record GradedTestCaseUpdate
{
    [JsonPropertyName("testCaseId")]
    public required string TestCaseId { get; }

    [JsonPropertyName("grade")]
    public required object Grade { get; }
}
