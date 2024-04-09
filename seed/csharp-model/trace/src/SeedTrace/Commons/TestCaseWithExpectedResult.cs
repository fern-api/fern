using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class TestCaseWithExpectedResult
{
    [JsonPropertyName("testCase")]
    public TestCase TestCase { get; init; }

    [JsonPropertyName("expectedResult")]
    public VariableValue ExpectedResult { get; init; }
}
