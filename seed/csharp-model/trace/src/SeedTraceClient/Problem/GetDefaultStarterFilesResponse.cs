using System.Text.Json.Serialization;
using StringEnum;
using SeedTraceClient;

namespace SeedTraceClient;

public class GetDefaultStarterFilesResponse
{
    [JsonPropertyName("files")]
    public Dictionary<StringEnum<Language>, ProblemFiles> Files { get; init; }
}
