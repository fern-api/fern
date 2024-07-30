using System.Text.Json.Serialization;
using SeedObjectsWithImports;

#nullable enable

namespace SeedObjectsWithImports;

public record File
{
    [JsonPropertyName("name")]
    public required string Name { get; }

    [JsonPropertyName("contents")]
    public required string Contents { get; }

    [JsonPropertyName("info")]
    public required FileInfo Info { get; }
}
