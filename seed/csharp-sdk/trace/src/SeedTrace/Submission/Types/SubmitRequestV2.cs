using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record SubmitRequestV2
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; init; }

    [JsonPropertyName("language")]
    public required Language Language { get; init; }

    [JsonPropertyName("submissionFiles")]
    public IEnumerable<SubmissionFileInfo> SubmissionFiles { get; init; } =
        new List<SubmissionFileInfo>();

    [JsonPropertyName("problemId")]
    public required string ProblemId { get; init; }

    [JsonPropertyName("problemVersion")]
    public int? ProblemVersion { get; init; }

    [JsonPropertyName("userId")]
    public string? UserId { get; init; }
}
