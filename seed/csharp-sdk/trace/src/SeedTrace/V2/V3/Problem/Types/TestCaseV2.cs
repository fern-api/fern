using System.Text.Json.Serialization;
using SeedTrace.V2.V3;

#nullable enable

namespace SeedTrace.V2.V3;

public record TestCaseV2
{
    [JsonPropertyName("metadata")]
    public required TestCaseMetadata Metadata { get; init; }

    [JsonPropertyName("implementation")]
    public required object Implementation { get; init; }

    [JsonPropertyName("arguments")]
    public Dictionary<string, object> Arguments { get; init; } = new Dictionary<string, object>();

    [JsonPropertyName("expects")]
    public TestCaseExpects? Expects { get; init; }
}
