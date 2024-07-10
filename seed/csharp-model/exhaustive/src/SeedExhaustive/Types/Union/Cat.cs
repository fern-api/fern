using System.Text.Json.Serialization;

#nullable enable

namespace SeedExhaustive.Types;

public record Cat
{
    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("likesToMeow")]
    public required bool LikesToMeow { get; init; }
}
