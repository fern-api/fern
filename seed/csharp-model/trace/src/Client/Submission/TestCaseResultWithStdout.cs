using System.Text.Json.Serialization;
using Client;

namespace Client;

public class TestCaseResultWithStdout
{
    [JsonPropertyName("result")]
    public TestCaseResult Result { get; init; }

    [JsonPropertyName("stdout")]
    public string Stdout { get; init; }
}
