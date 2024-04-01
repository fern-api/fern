using System.Text.Json.Serialization;
using OneOf;
using SeedTrace;

namespace SeedTrace;

public class GradedResponseV2
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("testCases")]
    public Dictionary<string, OneOf<TestCaseGrade._Hidden, TestCaseGrade._NonHidden>> TestCases { get; init; }
}
