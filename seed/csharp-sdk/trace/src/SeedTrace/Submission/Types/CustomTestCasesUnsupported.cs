using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record CustomTestCasesUnsupported
{
    [JsonPropertyName("problemId")]
    public required string ProblemId { get; set; }

    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; set; }
}
