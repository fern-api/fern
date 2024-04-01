using System.Text.Json.Serialization;

namespace Client;

public class StopRequest
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }
}
