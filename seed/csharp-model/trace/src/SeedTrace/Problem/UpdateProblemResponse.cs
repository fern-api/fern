using System.Text.Json.Serialization;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

public record UpdateProblemResponse
{
    [JsonPropertyName("problemVersion")]
    public required int ProblemVersion { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
