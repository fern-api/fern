using System.Text.Json.Serialization;
using Client;

namespace Client;

public class GradedResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("testCases")]
    public Dictionary<string, TestCaseResultWithStdout> TestCases { get; init; }
}
