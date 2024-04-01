using System.Text.Json.Serialization;

namespace SeedExhaustive.Types;

public class Cat
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("likesToMeow")]
    public bool LikesToMeow { get; init; }
}
