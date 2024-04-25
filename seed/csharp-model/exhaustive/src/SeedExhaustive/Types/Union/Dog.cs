using System.Text.Json.Serialization;

namespace SeedExhaustive.Types;

public class Dog
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("likesToWoof")]
    public bool LikesToWoof { get; init; }
}
