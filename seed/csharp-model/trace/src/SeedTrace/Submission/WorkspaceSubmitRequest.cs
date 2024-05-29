using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

public class WorkspaceSubmitRequest
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("language")]
    [JsonConverter(typeof(StringEnumSerializer<Language>))]
    public Language Language { get; init; }

    [JsonPropertyName("submissionFiles")]
    public List<SubmissionFileInfo> SubmissionFiles { get; init; }

    [JsonPropertyName("userId")]
    public string? UserId { get; init; }
}
