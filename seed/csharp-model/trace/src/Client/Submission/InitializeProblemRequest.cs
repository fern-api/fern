using System.Text.Json.Serialization;

namespace Client;

public class InitializeProblemRequest
{
    [JsonPropertyName("problemId")]
    public string ProblemId { get; init; }

    [JsonPropertyName("problemVersion")]
    public int? ProblemVersion { get; init; }
}
