using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2.V3;

namespace SeedTrace.V2.V3;

public class GetBasicSolutionFileResponse
{
    [JsonPropertyName("solutionFileByLanguage")]
    public List<Dictionary<Language, FileInfoV2>> SolutionFileByLanguage { get; init; }
}
