using System.Text.Json.Serialization

namespace SeedTraceClient

public class StopRequest
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }
}
