using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record WorkspaceFiles
{
    [JsonPropertyName("mainFile")]
    public required FileInfo MainFile { get; }

    [JsonPropertyName("readOnlyFiles")]
    public IEnumerable<FileInfo> ReadOnlyFiles { get; } = new List<FileInfo>();
}
