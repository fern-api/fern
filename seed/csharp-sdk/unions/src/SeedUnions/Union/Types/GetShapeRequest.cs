using System.Text.Json.Serialization;

namespace SeedUnions;

public class GetShapeRequest
{
    [JsonPropertyName("id")]
    public string Id { get; init; }
}
