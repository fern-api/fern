using System.Text.Json.Serialization;
using SeedObjectsWithImports;

#nullable enable

namespace SeedObjectsWithImports;

public record File
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("contents")]
    public required string Contents { get; set; }

    [JsonPropertyName("info")]
    public required FileInfo Info { get; set; }
}
