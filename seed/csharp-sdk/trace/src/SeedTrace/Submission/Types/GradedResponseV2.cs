using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class GradedResponseV2
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("testCases")]
    public Dictionary<string, TestCaseGrade> TestCases { get; init; }
}
