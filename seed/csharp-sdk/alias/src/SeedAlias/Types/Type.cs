using System.Text.Json.Serialization;

#nullable enable

namespace SeedAlias;

public record Type
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }
}
