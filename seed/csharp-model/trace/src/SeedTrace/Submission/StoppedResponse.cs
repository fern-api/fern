using System.Text.Json.Serialization;

namespace SeedTrace;

public class StoppedResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }
}
