using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record ErroredResponse
{
    [JsonPropertyName("submissionId")]
    public required Guid SubmissionId { get; init; }

    [JsonPropertyName("errorInfo")]
    public required object ErrorInfo { get; init; }
}
