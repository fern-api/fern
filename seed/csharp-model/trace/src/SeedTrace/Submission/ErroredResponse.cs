using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class ErroredResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("errorInfo")]
    public object ErrorInfo { get; init; }
}
