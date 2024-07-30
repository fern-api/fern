using System.Text.Json.Serialization;

#nullable enable

namespace SeedUnions;

public record GetShapeRequest
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }
}
