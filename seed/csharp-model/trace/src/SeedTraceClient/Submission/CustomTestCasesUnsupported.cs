using System.Text.Json.Serialization

namespace SeedTraceClient

public class CustomTestCasesUnsupported
{
    [JsonPropertyName("problemId")]
    public string ProblemId { get; init; }

    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }
}
