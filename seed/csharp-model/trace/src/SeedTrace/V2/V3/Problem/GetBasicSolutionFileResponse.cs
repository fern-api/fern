using System.Text.Json.Serialization;
using StringEnum;
using SeedTrace;
using SeedTrace.V2.V3;

namespace SeedTrace.V2.V3;

public class GetBasicSolutionFileResponse
{
    [JsonPropertyName("solutionFileByLanguage")]
    public Dictionary<StringEnum<Language>, FileInfoV2> SolutionFileByLanguage { get; init; }
}
