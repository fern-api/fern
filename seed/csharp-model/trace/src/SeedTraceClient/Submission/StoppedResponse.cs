using System.Text.Json.Serialization;

namespace SeedTraceClient;

public class StoppedResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }
}
