using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public class TestCaseResultWithStdout
{
    [JsonPropertyName("result")]
    public TestCaseResult Result { get; init; }

    [JsonPropertyName("stdout")]
    public string Stdout { get; init; }
}
