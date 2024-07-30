using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record RecordedResponseNotification
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; set; }

    [JsonPropertyName("traceResponsesSize")]
    public required int TraceResponsesSize { get; set; }

    [JsonPropertyName("testCaseId")]
    public string? TestCaseId { get; set; }
}
