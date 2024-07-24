using System.Text.Json.Serialization;

#nullable enable

namespace SeedStreaming;

public record RegularResponse
{
    [JsonPropertyName("id")]
    public required string Id { get; init; }

    [JsonPropertyName("name")]
    public string? Name { get; init; }
}
