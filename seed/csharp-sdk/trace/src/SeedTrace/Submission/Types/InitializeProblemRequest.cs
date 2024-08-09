using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record InitializeProblemRequest
{
    [JsonPropertyName("problemId")]
    public required string ProblemId { get; set; }

    [JsonPropertyName("problemVersion")]
    public int? ProblemVersion { get; set; }
}
