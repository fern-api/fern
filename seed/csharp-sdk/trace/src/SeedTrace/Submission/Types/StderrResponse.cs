using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record StderrResponse
{
    [JsonPropertyName("submissionId")]
    public required Guid SubmissionId { get; init; }

    [JsonPropertyName("stderr")]
    public required string Stderr { get; init; }
}
