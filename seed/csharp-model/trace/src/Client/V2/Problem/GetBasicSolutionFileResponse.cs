using System.Text.Json.Serialization;
using StringEnum;
using Client;
using Client.V2;

namespace Client.V2;

public class GetBasicSolutionFileResponse
{
    [JsonPropertyName("solutionFileByLanguage")]
    public Dictionary<StringEnum<Language>, FileInfoV2> SolutionFileByLanguage { get; init; }
}
