using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record StoreTracedTestCaseRequest
{
    [JsonPropertyName("result")]
    public required TestCaseResultWithStdout Result { get; }

    [JsonPropertyName("traceResponses")]
    public IEnumerable<TraceResponse> TraceResponses { get; } = new List<TraceResponse>();
}
