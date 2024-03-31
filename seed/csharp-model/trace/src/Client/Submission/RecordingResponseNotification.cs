using System.Text.Json.Serialization;
using Client;

namespace Client;

public class RecordingResponseNotification
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("testCaseId")]
    public string? TestCaseId { get; init; }

    [JsonPropertyName("lineNumber")]
    public int LineNumber { get; init; }

    [JsonPropertyName("lightweightStackInfo")]
    public LightweightStackframeInformation LightweightStackInfo { get; init; }

    [JsonPropertyName("tracedFile")]
    public TracedFile? TracedFile { get; init; }
}
