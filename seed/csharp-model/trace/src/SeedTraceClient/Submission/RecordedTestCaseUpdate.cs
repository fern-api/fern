using System.Text.Json.Serialization

namespace SeedTraceClient

public class RecordedTestCaseUpdate
{
    [JsonPropertyName("testCaseId")]
    public string TestCaseId { get; init; }
    [JsonPropertyName("traceResponsesSize")]
    public int TraceResponsesSize { get; init; }
}
