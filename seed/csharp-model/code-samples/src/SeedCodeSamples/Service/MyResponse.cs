using System.Text.Json.Serialization;

#nullable enable

namespace SeedCodeSamples;

public record MyResponse
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }
}
