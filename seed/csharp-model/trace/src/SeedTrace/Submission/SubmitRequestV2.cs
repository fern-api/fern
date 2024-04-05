using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class SubmitRequestV2
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("language")]
    public Language Language { get; init; }

    [JsonPropertyName("submissionFiles")]
    public List<SubmissionFileInfo> SubmissionFiles { get; init; }

    [JsonPropertyName("problemId")]
    public string ProblemId { get; init; }

    [JsonPropertyName("problemVersion")]
    public int? ProblemVersion { get; init; }

    [JsonPropertyName("userId")]
    public string? UserId { get; init; }
}
