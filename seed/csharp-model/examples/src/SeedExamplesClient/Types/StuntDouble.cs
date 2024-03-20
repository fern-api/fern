using System.Text.Json.Serialization

namespace SeedExamplesClient

public class StuntDouble
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("actorOrActressId")]
    public string ActorOrActressId { get; init; }
}
