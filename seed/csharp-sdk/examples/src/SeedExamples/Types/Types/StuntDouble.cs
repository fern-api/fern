using System.Text.Json.Serialization;

namespace SeedExamples;

public class StuntDouble
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("actorOrActressId")]
    public string ActorOrActressId { get; init; }
}
