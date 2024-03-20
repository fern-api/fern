using System.Text.Json.Serialization
using StringEnum
using SeedTraceClient

namespace SeedTraceClient

public class WorkspaceStarterFilesResponse
{
    [JsonPropertyName("files")]
    public Dictionary<StringEnum<Language>, WorkspaceFiles> Files { get; init; }
}
