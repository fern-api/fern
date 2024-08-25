using System.Text.Json.Serialization;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

public record WorkspaceStarterFilesResponse
{
    [JsonPropertyName("files")]
    public Dictionary<Language, WorkspaceFiles> Files { get; set; } =
        new Dictionary<Language, WorkspaceFiles>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
