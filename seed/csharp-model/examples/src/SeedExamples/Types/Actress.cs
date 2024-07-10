using System.Text.Json.Serialization;

#nullable enable

namespace SeedExamples;

public record Actress
{
    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("id")]
    public required string Id { get; init; }
}
