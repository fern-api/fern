using System.Text.Json.Serialization;
using SeedObjectsWithImports.Commons;

#nullable enable

namespace SeedObjectsWithImports;

public record Node
{
    [JsonPropertyName("id")]
    public required string Id { get; }

    [JsonPropertyName("label")]
    public string? Label { get; }

    [JsonPropertyName("metadata")]
    public Metadata? Metadata { get; }
}
