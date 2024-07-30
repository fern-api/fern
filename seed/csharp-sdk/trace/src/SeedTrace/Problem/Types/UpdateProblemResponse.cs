using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record UpdateProblemResponse
{
    [JsonPropertyName("problemVersion")]
    public required int ProblemVersion { get; set; }
}
