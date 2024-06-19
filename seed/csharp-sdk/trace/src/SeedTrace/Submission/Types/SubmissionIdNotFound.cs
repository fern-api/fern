using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class SubmissionIdNotFound
{
    [JsonPropertyName("missingSubmissionId")]
    public Guid MissingSubmissionId { get; init; }
}
