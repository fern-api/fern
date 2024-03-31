using System.Text.Json.Serialization;
using StringEnum;
using Client;
using Client.V2;

namespace Client;

public class WorkspaceStarterFilesResponseV2
{
    [JsonPropertyName("filesByLanguage")]
    public Dictionary<StringEnum<Language>, Files> FilesByLanguage { get; init; }
}
