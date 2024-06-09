using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class StderrResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("stderr")]
    public string Stderr { get; init; }
}
