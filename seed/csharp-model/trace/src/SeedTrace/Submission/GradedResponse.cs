using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record GradedResponse
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; init; }

    [JsonPropertyName("testCases")]
    public Dictionary<string, TestCaseResultWithStdout> TestCases { get; init; } =
        new Dictionary<string, TestCaseResultWithStdout>();
}
