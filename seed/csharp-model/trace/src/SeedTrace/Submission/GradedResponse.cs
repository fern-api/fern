using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class GradedResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("testCases")]
    public List<Dictionary<string, TestCaseResultWithStdout>> TestCases { get; init; }
}
