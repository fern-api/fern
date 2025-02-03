using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record RecordingResponseNotification
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; set; }

    [JsonPropertyName("testCaseId")]
    public string? TestCaseId { get; set; }

    [JsonPropertyName("lineNumber")]
    public required int LineNumber { get; set; }

    [JsonPropertyName("lightweightStackInfo")]
    public required LightweightStackframeInformation LightweightStackInfo { get; set; }

    [JsonPropertyName("tracedFile")]
    public TracedFile? TracedFile { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
