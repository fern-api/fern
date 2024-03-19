using System.Text.Json.Serialization
using SeedTraceClient

namespace SeedTraceClient

public class TestCaseResultWithStdout
{
    [JsonPropertyName("result")]
    public TestCaseResult Result { get; init; }
    [JsonPropertyName("stdout")]
    public string Stdout { get; init; }
}
