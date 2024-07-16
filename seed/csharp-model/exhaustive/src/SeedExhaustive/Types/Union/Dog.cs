using System.Text.Json.Serialization;

#nullable enable

namespace SeedExhaustive.Types;

public record Dog
{
    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("likesToWoof")]
    public required bool LikesToWoof { get; init; }
}
