using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2;

namespace SeedTrace.V2;

public class TestCaseV2
{
    [JsonPropertyName("metadata")]
    public TestCaseMetadata Metadata { get; init; }

    [JsonPropertyName("implementation")]
    public TestCaseImplementationReference Implementation { get; init; }

    [JsonPropertyName("arguments")]
    public Dictionary<string, VariableValue> Arguments { get; init; }

    [JsonPropertyName("expects")]
    public TestCaseExpects? Expects { get; init; }
}
