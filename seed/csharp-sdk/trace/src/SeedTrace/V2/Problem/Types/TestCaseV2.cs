using System.Text.Json.Serialization;
using SeedTrace.V2;
using SeedTrace;

namespace SeedTrace.V2;

public class TestCaseV2
{
    [JsonPropertyName("metadata")]
    public TestCaseMetadata Metadata { get; init; }

    [JsonPropertyName("implementation")]
    public TestCaseImplementationReference Implementation { get; init; }

    [JsonPropertyName("arguments")]
    public List<Dictionary<string, VariableValue>> Arguments { get; init; }

    [JsonPropertyName("expects")]
    public List<TestCaseExpects?> Expects { get; init; }
}
