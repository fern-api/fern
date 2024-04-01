using System.Text.Json.Serialization;

namespace SeedTrace;

public class RecordedResponseNotification
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("traceResponsesSize")]
    public int TraceResponsesSize { get; init; }

    [JsonPropertyName("testCaseId")]
    public string? TestCaseId { get; init; }
}
