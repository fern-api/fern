using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2.V3;

#nullable enable

namespace SeedTrace.V2.V3;

public record GetBasicSolutionFileResponse
{
    [JsonPropertyName("solutionFileByLanguage")]
    public Dictionary<Language, FileInfoV2> SolutionFileByLanguage { get; set; } =
        new Dictionary<Language, FileInfoV2>();
}
