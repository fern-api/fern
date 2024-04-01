using System.Text.Json.Serialization;

namespace SeedTrace;

public class StopRequest
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }
}
