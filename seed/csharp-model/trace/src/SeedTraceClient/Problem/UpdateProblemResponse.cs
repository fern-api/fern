using System.Text.Json.Serialization;

namespace SeedTraceClient;

public class UpdateProblemResponse
{
    [JsonPropertyName("problemVersion")]
    public int ProblemVersion { get; init; }
}
