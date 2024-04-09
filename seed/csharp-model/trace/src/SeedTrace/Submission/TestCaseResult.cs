using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class TestCaseResult
{
    [JsonPropertyName("expectedResult")]
    public VariableValue ExpectedResult { get; init; }

    [JsonPropertyName("actualResult")]
    public ActualResult ActualResult { get; init; }

    [JsonPropertyName("passed")]
    public bool Passed { get; init; }
}
