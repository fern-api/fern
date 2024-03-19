using System.Text.Json.Serialization

namespace SeedTraceClient

public class SubmissionIdNotFound
{
    [JsonPropertyName("missingSubmissionId")]
    public Guid MissingSubmissionId { get; init; }
}
