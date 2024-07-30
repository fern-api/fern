using System.Text.Json.Serialization;

#nullable enable

namespace SeedExamples;

public record StuntDouble
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("actorOrActressId")]
    public required string ActorOrActressId { get; set; }
}
