using System.Text.Json.Serialization;
using StringEnum;
using Client;

namespace Client;

public class WorkspaceStarterFilesResponse
{
    [JsonPropertyName("files")]
    public Dictionary<StringEnum<Language>, WorkspaceFiles> Files { get; init; }
}
