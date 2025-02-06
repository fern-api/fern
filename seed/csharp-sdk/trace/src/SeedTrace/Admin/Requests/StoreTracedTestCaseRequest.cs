using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record StoreTracedTestCaseRequest
{
    [JsonPropertyName("result")]
    public required TestCaseResultWithStdout Result { get; set; }

    [JsonPropertyName("traceResponses")]
    public IEnumerable<TraceResponse> TraceResponses { get; set; } = new List<TraceResponse>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
