using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class WorkspaceSubmitRequest
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("language")]
    public Language Language { get; init; }

    [JsonPropertyName("submissionFiles")]
    public List<List<SubmissionFileInfo>> SubmissionFiles { get; init; }

    [JsonPropertyName("userId")]
    public List<string?> UserId { get; init; }
}
