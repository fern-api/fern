using System.Text.Json.Serialization;

namespace Client;

public class FinishedResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }
}
