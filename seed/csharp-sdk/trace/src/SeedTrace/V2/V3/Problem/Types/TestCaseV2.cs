using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2.V3;

#nullable enable

namespace SeedTrace.V2.V3;

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
