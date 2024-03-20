using System.Text.Json.Serialization;

namespace SeedTraceClient.V2.V3;

public class TestCaseExpects
{
    [JsonPropertyName("expectedStdout")]
    public string? ExpectedStdout { get; init; }
}
