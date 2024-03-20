using System.Text.Json.Serialization;

namespace SeedTraceClient.V2;

public class TestCaseExpects
{
    [JsonPropertyName("expectedStdout")]
    public string? ExpectedStdout { get; init; }
}
