using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record RecordedResponseNotification
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; set; }

    [JsonPropertyName("traceResponsesSize")]
    public required int TraceResponsesSize { get; set; }

    [JsonPropertyName("testCaseId")]
    public string? TestCaseId { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
