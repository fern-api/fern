using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record InitializeProblemRequest
{
    [JsonPropertyName("problemId")]
    public required string ProblemId { get; set; }

    [JsonPropertyName("problemVersion")]
    public int? ProblemVersion { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
