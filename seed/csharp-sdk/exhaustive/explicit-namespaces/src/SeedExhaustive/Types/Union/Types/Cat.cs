using System.Text.Json.Serialization;

#nullable enable

namespace SeedExhaustive.Types.Union;

public record Cat
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("likesToMeow")]
    public required bool LikesToMeow { get; set; }
}
