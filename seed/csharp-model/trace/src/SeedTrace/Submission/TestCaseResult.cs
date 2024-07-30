using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record TestCaseResult
{
    [JsonPropertyName("expectedResult")]
    public required object ExpectedResult { get; }

    [JsonPropertyName("actualResult")]
    public required object ActualResult { get; }

    [JsonPropertyName("passed")]
    public required bool Passed { get; }
}
