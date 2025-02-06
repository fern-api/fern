using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record WorkspaceStarterFilesResponseV2
{
    [JsonPropertyName("filesByLanguage")]
    public Dictionary<Language, V2.Files> FilesByLanguage { get; set; } =
        new Dictionary<Language, V2.Files>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
