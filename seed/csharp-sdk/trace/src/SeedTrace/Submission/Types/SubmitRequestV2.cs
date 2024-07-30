using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record SubmitRequestV2
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; }

    [JsonPropertyName("language")]
    public required Language Language { get; }

    [JsonPropertyName("submissionFiles")]
    public IEnumerable<SubmissionFileInfo> SubmissionFiles { get; } =
        new List<SubmissionFileInfo>();

    [JsonPropertyName("problemId")]
    public required string ProblemId { get; }

    [JsonPropertyName("problemVersion")]
    public int? ProblemVersion { get; }

    [JsonPropertyName("userId")]
    public string? UserId { get; }
}
