using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class UpdateProblemResponse
{
    [JsonPropertyName("problemVersion")]
    public int ProblemVersion { get; init; }
}
