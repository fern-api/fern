using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class TestCaseResult
{
    [JsonPropertyName("expectedResult")]
    public object ExpectedResult { get; init; }

    [JsonPropertyName("actualResult")]
    public object ActualResult { get; init; }

    [JsonPropertyName("passed")]
    public bool Passed { get; init; }
}
