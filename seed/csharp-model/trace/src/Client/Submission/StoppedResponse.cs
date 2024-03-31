using System.Text.Json.Serialization;

namespace Client;

public class StoppedResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }
}
