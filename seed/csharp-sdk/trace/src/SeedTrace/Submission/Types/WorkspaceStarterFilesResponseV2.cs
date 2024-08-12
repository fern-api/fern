using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record WorkspaceStarterFilesResponseV2
{
    [JsonPropertyName("filesByLanguage")]
    public Dictionary<Language, V2.Files> FilesByLanguage { get; set; } =
        new Dictionary<Language, V2.Files>();
}
