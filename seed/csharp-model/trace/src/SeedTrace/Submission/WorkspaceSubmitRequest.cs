using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record WorkspaceSubmitRequest
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; set; }

    [JsonPropertyName("language")]
    public required Language Language { get; set; }

    [JsonPropertyName("submissionFiles")]
    public IEnumerable<SubmissionFileInfo> SubmissionFiles { get; set; } =
        new List<SubmissionFileInfo>();

    [JsonPropertyName("userId")]
    public string? UserId { get; set; }
}
