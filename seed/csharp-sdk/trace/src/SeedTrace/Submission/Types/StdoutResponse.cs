using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record StdoutResponse
{
    [JsonPropertyName("submissionId")]
    public required Guid SubmissionId { get; init; }

    [JsonPropertyName("stdout")]
    public required string Stdout { get; init; }
}
