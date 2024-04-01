using System.Text.Json.Serialization;

namespace SeedTrace;

public class SubmissionIdNotFound
{
    [JsonPropertyName("missingSubmissionId")]
    public Guid MissingSubmissionId { get; init; }
}
