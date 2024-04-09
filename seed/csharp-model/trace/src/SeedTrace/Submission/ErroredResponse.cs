using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class ErroredResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("errorInfo")]
    public ErrorInfo ErrorInfo { get; init; }
}
