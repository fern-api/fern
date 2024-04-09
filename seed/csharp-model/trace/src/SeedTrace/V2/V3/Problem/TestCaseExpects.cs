using System.Text.Json.Serialization;

namespace SeedTrace.V2.V3;

public class TestCaseExpects
{
    [JsonPropertyName("expectedStdout")]
    public List<string?> ExpectedStdout { get; init; }
}
