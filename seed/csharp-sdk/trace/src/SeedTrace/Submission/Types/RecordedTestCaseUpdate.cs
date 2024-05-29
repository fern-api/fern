using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class RecordedTestCaseUpdate
{
    [JsonPropertyName("testCaseId")]
    public string TestCaseId { get; init; }

    [JsonPropertyName("traceResponsesSize")]
    public int TraceResponsesSize { get; init; }
}
