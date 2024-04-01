using System.Text.Json.Serialization;

namespace SeedTrace;

public class UpdateProblemResponse
{
    [JsonPropertyName("problemVersion")]
    public int ProblemVersion { get; init; }
}
