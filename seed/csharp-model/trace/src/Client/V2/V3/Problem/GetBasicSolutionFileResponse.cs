using System.Text.Json.Serialization;
using StringEnum;
using Client;
using Client.V2.V3;

namespace Client.V2.V3;

public class GetBasicSolutionFileResponse
{
    [JsonPropertyName("solutionFileByLanguage")]
    public Dictionary<StringEnum<Language>, FileInfoV2> SolutionFileByLanguage { get; init; }
}
