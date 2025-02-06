using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record RecordedTestCaseUpdate
{
    [JsonPropertyName("testCaseId")]
    public required string TestCaseId { get; set; }

    [JsonPropertyName("traceResponsesSize")]
    public required int TraceResponsesSize { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
