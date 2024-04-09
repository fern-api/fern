using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class WorkspaceStarterFilesResponse
{
    [JsonPropertyName("files")]
    public List<Dictionary<Language, WorkspaceFiles>> Files { get; init; }
}
