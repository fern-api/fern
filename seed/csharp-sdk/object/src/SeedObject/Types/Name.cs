using System.Text.Json.Serialization;

#nullable enable

namespace SeedObject;

public record Name
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("value")]
    public required string Value { get; set; }
}
