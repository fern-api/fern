using System.Text.Json.Serialization;
using SeedTrace.V2;

#nullable enable

namespace SeedTrace.V2;

public class TestCaseV2
{
    [JsonPropertyName("metadata")]
    public TestCaseMetadata Metadata { get; init; }

    [JsonPropertyName("implementation")]
    public object Implementation { get; init; }

    [JsonPropertyName("arguments")]
    public Dictionary<string, object> Arguments { get; init; }

    [JsonPropertyName("expects")]
    public TestCaseExpects? Expects { get; init; }
}
