using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class TestCaseResultWithStdout
{
    [JsonPropertyName("result")]
    public TestCaseResult Result { get; init; }

    [JsonPropertyName("stdout")]
    public string Stdout { get; init; }
}
