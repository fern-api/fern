using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record StderrResponse
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; }

    [JsonPropertyName("stderr")]
    public required string Stderr { get; }
}
