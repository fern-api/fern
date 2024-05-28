using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class InitializeProblemRequest
{
    [JsonPropertyName("problemId")]
    public string ProblemId { get; init; }

    [JsonPropertyName("problemVersion")]
    public int? ProblemVersion { get; init; }
}
