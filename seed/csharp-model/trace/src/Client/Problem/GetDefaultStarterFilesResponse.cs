using System.Text.Json.Serialization;
using StringEnum;
using Client;

namespace Client;

public class GetDefaultStarterFilesResponse
{
    [JsonPropertyName("files")]
    public Dictionary<StringEnum<Language>, ProblemFiles> Files { get; init; }
}
