using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2;

namespace SeedTrace;

public class WorkspaceStarterFilesResponseV2
{
    [JsonPropertyName("filesByLanguage")]
    public List<Dictionary<Language, Files>> FilesByLanguage { get; init; }
}
