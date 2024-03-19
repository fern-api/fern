using System.Text.Json.Serialization
using StringEnum
using SeedTraceClient
using SeedTraceClient.V2

namespace SeedTraceClient.V2

public class GetBasicSolutionFileResponse
{
    [JsonPropertyName("solutionFileByLanguage")]
    public Dictionary<StringEnum<Language>,FileInfoV2> SolutionFileByLanguage { get; init; }
}
