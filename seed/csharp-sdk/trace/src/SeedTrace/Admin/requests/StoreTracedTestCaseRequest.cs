using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class StoreTracedTestCaseRequest
{
    [JsonPropertyName("result")]
    public TestCaseResultWithStdout Result { get; init; }

    [JsonPropertyName("traceResponses")]
    public List<TraceResponse> TraceResponses { get; init; }
}
