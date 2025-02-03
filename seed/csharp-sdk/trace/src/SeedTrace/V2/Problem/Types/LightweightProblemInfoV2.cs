using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2;

public record LightweightProblemInfoV2
{
    [JsonPropertyName("problemId")]
    public required string ProblemId { get; set; }

    [JsonPropertyName("problemName")]
    public required string ProblemName { get; set; }

    [JsonPropertyName("problemVersion")]
    public required int ProblemVersion { get; set; }

    [JsonPropertyName("variableTypes")]
    public HashSet<object> VariableTypes { get; set; } = new HashSet<object>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
