using System.Text.Json.Serialization;

namespace SeedTrace;

public class RecordedResponseNotification
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("traceResponsesSize")]
    public int TraceResponsesSize { get; init; }

    [JsonPropertyName("testCaseId")]
    public List<string?> TestCaseId { get; init; }
}
