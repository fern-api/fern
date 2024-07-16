using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record SubmissionIdNotFound
{
    [JsonPropertyName("missingSubmissionId")]
    public required Guid MissingSubmissionId { get; init; }
}
