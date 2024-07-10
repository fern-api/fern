using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record StoppedResponse
{
    [JsonPropertyName("submissionId")]
    public required Guid SubmissionId { get; init; }
}
