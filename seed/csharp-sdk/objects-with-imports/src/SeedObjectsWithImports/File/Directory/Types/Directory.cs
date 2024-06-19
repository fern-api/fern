using System.Text.Json.Serialization;
using SeedObjectsWithImports;
using SeedObjectsWithImports.File;

#nullable enable

namespace SeedObjectsWithImports.File;

public class Directory
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("files")]
    public IEnumerable<File>? Files { get; init; }

    [JsonPropertyName("directories")]
    public IEnumerable<Directory>? Directories { get; init; }
}
