using System.Text.Json.Serialization;

namespace SeedTrace;

public class FinishedResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }
}
