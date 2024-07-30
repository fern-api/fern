using System.Text.Json.Serialization;

#nullable enable

namespace SeedStreaming;

public record StreamResponse
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }
}
