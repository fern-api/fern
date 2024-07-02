using System.Text.Json.Serialization;

#nullable enable

namespace SeedExhaustive.Types;

public class Dog
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("likesToWoof")]
    public bool LikesToWoof { get; init; }
}
