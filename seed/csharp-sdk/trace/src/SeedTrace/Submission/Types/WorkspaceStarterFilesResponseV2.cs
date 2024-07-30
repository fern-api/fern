using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2;

#nullable enable

namespace SeedTrace;

public record WorkspaceStarterFilesResponseV2
{
    [JsonPropertyName("filesByLanguage")]
    public Dictionary<Language, Files> FilesByLanguage { get; set; } =
        new Dictionary<Language, Files>();
}
