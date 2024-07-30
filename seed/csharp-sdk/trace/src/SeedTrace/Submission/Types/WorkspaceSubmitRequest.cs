using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record WorkspaceSubmitRequest
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; }

    [JsonPropertyName("language")]
    public required Language Language { get; }

    [JsonPropertyName("submissionFiles")]
    public IEnumerable<SubmissionFileInfo> SubmissionFiles { get; } =
        new List<SubmissionFileInfo>();

    [JsonPropertyName("userId")]
    public string? UserId { get; }
}
