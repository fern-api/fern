using System.Text.Json.Serialization;

#nullable enable

namespace SeedExhaustive.Types.Union;

public record Dog
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("likesToWoof")]
    public required bool LikesToWoof { get; set; }
}
