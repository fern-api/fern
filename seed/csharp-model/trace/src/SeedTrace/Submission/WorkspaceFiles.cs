using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public class WorkspaceFiles
{
    [JsonPropertyName("mainFile")]
    public FileInfo MainFile { get; init; }

    [JsonPropertyName("readOnlyFiles")]
    public List<FileInfo> ReadOnlyFiles { get; init; }
}
