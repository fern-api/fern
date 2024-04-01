using System.Text.Json.Serialization;
using StringEnum;
using SeedTrace;

namespace SeedTrace;

public class GetDefaultStarterFilesResponse
{
    [JsonPropertyName("files")]
    public Dictionary<StringEnum<Language>, ProblemFiles> Files { get; init; }
}
