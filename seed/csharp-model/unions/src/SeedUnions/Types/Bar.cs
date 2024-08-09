using System.Text.Json.Serialization;

#nullable enable

namespace SeedUnions;

public record Bar
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }
}
