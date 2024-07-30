using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace.V2;

public record LightweightProblemInfoV2
{
    [JsonPropertyName("problemId")]
    public required string ProblemId { get; }

    [JsonPropertyName("problemName")]
    public required string ProblemName { get; }

    [JsonPropertyName("problemVersion")]
    public required int ProblemVersion { get; }

    [JsonPropertyName("variableTypes")]
    public HashSet<object> VariableTypes { get; } = new HashSet<object>();
}
