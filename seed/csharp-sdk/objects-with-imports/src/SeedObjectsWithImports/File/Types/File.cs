using System.Text.Json.Serialization;
using SeedObjectsWithImports;

#nullable enable

namespace SeedObjectsWithImports.File.Types;

public record File
{
    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("contents")]
    public required string Contents { get; init; }

    [JsonPropertyName("info")]
    public required FileInfo Info { get; init; }
}
