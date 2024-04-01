using System.Text.Json.Serialization;

namespace Client;

public class StderrResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("stderr")]
    public string Stderr { get; init; }
}
