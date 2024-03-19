using System.Text.Json.Serialization
using OneOf
using SeedTraceClient

namespace SeedTraceClient

public class GradedResponseV2
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }
    [JsonPropertyName("testCases")]
    public Dictionary<string,OneOf<TestCaseHiddenGrade,TestCaseNonHiddenGrade>> TestCases { get; init; }
}
