using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record StoreTracedTestCaseRequest
{
    [JsonPropertyName("result")]
    public required TestCaseResultWithStdout Result { get; set; }

    [JsonPropertyName("traceResponses")]
    public IEnumerable<TraceResponse> TraceResponses { get; set; } = new List<TraceResponse>();
}
