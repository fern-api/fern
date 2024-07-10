using System.Text.Json.Serialization;

#nullable enable

namespace SeedCodeSamples;

public record MyResponse
{
    [JsonPropertyName("id")]
    public required string Id { get; init; }

    [JsonPropertyName("name")]
    public string? Name { get; init; }
}
