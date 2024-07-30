using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record WorkspaceFiles
{
    [JsonPropertyName("mainFile")]
    public required FileInfo MainFile { get; set; }

    [JsonPropertyName("readOnlyFiles")]
    public IEnumerable<FileInfo> ReadOnlyFiles { get; set; } = new List<FileInfo>();
}
