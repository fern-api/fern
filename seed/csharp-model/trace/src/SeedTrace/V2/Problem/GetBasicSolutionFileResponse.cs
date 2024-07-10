using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2;

#nullable enable

namespace SeedTrace.V2;

public record GetBasicSolutionFileResponse
{
    [JsonPropertyName("solutionFileByLanguage")]
    public Dictionary<Language, FileInfoV2> SolutionFileByLanguage { get; init; } =
        new Dictionary<Language, FileInfoV2>();
}
