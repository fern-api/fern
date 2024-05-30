using System.Text.Json.Serialization;
using SeedObjectsWithImports;

#nullable enable

namespace SeedObjectsWithImports;

public class File
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("contents")]
    public string Contents { get; init; }

    [JsonPropertyName("info")]
    public FileInfo Info { get; init; }
}
