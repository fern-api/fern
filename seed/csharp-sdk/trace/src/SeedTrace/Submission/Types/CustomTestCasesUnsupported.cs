using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record CustomTestCasesUnsupported
{
    [JsonPropertyName("problemId")]
    public required string ProblemId { get; }

    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; }
}
