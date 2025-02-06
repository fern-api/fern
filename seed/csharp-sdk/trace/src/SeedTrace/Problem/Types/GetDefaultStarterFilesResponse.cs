using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record GetDefaultStarterFilesResponse
{
    [JsonPropertyName("files")]
    public Dictionary<Language, ProblemFiles> Files { get; set; } =
        new Dictionary<Language, ProblemFiles>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
