using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record WorkspaceFiles
{
    [JsonPropertyName("mainFile")]
    public required FileInfo MainFile { get; init; }

    [JsonPropertyName("readOnlyFiles")]
    public IEnumerable<FileInfo> ReadOnlyFiles { get; init; } = new List<FileInfo>();
}
