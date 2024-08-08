using System.Text.Json.Serialization;

#nullable enable

namespace SeedQueryParameters;

public record NestedUser
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("user")]
    public required User User { get; set; }
}
