using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace.V2.V3;

public class TestCaseExpects
{
    [JsonPropertyName("expectedStdout")]
    public string? ExpectedStdout { get; init; }
}
