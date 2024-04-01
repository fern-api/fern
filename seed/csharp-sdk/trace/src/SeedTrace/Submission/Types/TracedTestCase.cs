using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class TracedTestCase
{
    [JsonPropertyName("result")]
    public TestCaseResultWithStdout Result { get; init; }

    [JsonPropertyName("traceResponsesSize")]
    public int TraceResponsesSize { get; init; }
}
