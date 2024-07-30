using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record RecordedResponseNotification
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; }

    [JsonPropertyName("traceResponsesSize")]
    public required int TraceResponsesSize { get; }

    [JsonPropertyName("testCaseId")]
    public string? TestCaseId { get; }
}
