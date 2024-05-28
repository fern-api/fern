using System.Text.Json.Serialization;

#nullable enable

namespace SeedExamples;

public class StuntDouble
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("actorOrActressId")]
    public string ActorOrActressId { get; init; }
}
