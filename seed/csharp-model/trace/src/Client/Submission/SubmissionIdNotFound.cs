using System.Text.Json.Serialization;

namespace Client;

public class SubmissionIdNotFound
{
    [JsonPropertyName("missingSubmissionId")]
    public Guid MissingSubmissionId { get; init; }
}
