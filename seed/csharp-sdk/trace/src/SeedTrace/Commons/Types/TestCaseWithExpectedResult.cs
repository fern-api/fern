using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record TestCaseWithExpectedResult
{
    [JsonPropertyName("testCase")]
    public required TestCase TestCase { get; set; }

    [JsonPropertyName("expectedResult")]
    public required object ExpectedResult { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
