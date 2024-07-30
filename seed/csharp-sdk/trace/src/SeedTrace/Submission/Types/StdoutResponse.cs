using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record StdoutResponse
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; }

    [JsonPropertyName("stdout")]
    public required string Stdout { get; }
}
