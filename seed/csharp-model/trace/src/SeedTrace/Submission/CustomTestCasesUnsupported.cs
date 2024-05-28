using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class CustomTestCasesUnsupported
{
    [JsonPropertyName("problemId")]
    public string ProblemId { get; init; }

    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }
}
