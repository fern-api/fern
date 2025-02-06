using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record TracedTestCase
{
    [JsonPropertyName("result")]
    public required TestCaseResultWithStdout Result { get; set; }

    [JsonPropertyName("traceResponsesSize")]
    public required int TraceResponsesSize { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
