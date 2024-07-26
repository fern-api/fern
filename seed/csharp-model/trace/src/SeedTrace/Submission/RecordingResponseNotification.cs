using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record RecordingResponseNotification
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; init; }

    [JsonPropertyName("testCaseId")]
    public string? TestCaseId { get; init; }

    [JsonPropertyName("lineNumber")]
    public required int LineNumber { get; init; }

    [JsonPropertyName("lightweightStackInfo")]
    public required LightweightStackframeInformation LightweightStackInfo { get; init; }

    [JsonPropertyName("tracedFile")]
    public TracedFile? TracedFile { get; init; }
}
