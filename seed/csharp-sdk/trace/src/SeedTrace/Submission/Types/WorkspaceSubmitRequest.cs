using System.Text.Json.Serialization;
using StringEnum;
using SeedTrace;

namespace SeedTrace;

public class WorkspaceSubmitRequest
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("language")]
    public StringEnum<Language> Language { get; init; }

    [JsonPropertyName("submissionFiles")]
    public List<SubmissionFileInfo> SubmissionFiles { get; init; }

    [JsonPropertyName("userId")]
    public string? UserId { get; init; }
}
