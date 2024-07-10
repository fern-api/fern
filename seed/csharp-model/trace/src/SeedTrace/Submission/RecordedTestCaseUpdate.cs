using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record RecordedTestCaseUpdate
{
    [JsonPropertyName("testCaseId")]
    public required string TestCaseId { get; init; }

    [JsonPropertyName("traceResponsesSize")]
    public required int TraceResponsesSize { get; init; }
}
