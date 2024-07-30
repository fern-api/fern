using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record GradedResponse
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; }

    [JsonPropertyName("testCases")]
    public Dictionary<string, TestCaseResultWithStdout> TestCases { get; } =
        new Dictionary<string, TestCaseResultWithStdout>();
}
