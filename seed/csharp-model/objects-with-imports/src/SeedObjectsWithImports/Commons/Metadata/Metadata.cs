using System.Text.Json.Serialization;

#nullable enable

namespace SeedObjectsWithImports.Commons;

public record Metadata
{
    [JsonPropertyName("id")]
    public required string Id { get; init; }

    [JsonPropertyName("data")]
    public Dictionary<string, string>? Data { get; init; }
}
