using System.Text.Json.Serialization;

namespace Client;

public class UpdateProblemResponse
{
    [JsonPropertyName("problemVersion")]
    public int ProblemVersion { get; init; }
}
