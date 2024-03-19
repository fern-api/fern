using System.Text.Json.Serialization

namespace SeedTraceClient

public class FinishedResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }
}
