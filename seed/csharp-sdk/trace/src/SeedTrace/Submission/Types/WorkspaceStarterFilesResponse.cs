using System.Text.Json.Serialization;
using StringEnum;
using SeedTrace;

namespace SeedTrace;

public class WorkspaceStarterFilesResponse
{
    [JsonPropertyName("files")]
    public Dictionary<StringEnum<Language>, WorkspaceFiles> Files { get; init; }
}
