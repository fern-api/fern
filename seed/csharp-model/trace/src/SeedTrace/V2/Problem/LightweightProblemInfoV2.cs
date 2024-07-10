using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace.V2;

public record LightweightProblemInfoV2
{
    [JsonPropertyName("problemId")]
    public required string ProblemId { get; init; }

    [JsonPropertyName("problemName")]
    public required string ProblemName { get; init; }

    [JsonPropertyName("problemVersion")]
    public required int ProblemVersion { get; init; }

    [JsonPropertyName("variableTypes")]
    public HashSet<object> VariableTypes { get; init; } = new HashSet<object>();
}
