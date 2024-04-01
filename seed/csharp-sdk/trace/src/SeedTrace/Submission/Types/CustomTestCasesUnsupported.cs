using System.Text.Json.Serialization;

namespace SeedTrace;

public class CustomTestCasesUnsupported
{
    [JsonPropertyName("problemId")]
    public string ProblemId { get; init; }

    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }
}
