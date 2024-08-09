using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record StderrResponse
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; set; }

    [JsonPropertyName("stderr")]
    public required string Stderr { get; set; }
}
