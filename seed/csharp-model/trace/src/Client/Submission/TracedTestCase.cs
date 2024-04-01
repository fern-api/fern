using System.Text.Json.Serialization;
using Client;

namespace Client;

public class TracedTestCase
{
    [JsonPropertyName("result")]
    public TestCaseResultWithStdout Result { get; init; }

    [JsonPropertyName("traceResponsesSize")]
    public int TraceResponsesSize { get; init; }
}
