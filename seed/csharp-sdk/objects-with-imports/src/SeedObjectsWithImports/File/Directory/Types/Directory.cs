using System.Text.Json.Serialization;
using SeedObjectsWithImports;
using SeedObjectsWithImports.File;

#nullable enable

namespace SeedObjectsWithImports.File;

public record Directory
{
    [JsonPropertyName("name")]
    public required string Name { get; }

    [JsonPropertyName("files")]
    public IEnumerable<File>? Files { get; }

    [JsonPropertyName("directories")]
    public IEnumerable<Directory>? Directories { get; }
}
