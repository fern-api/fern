using System.Text.Json.Serialization;

#nullable enable

namespace SeedUnions;

public class GetShapeRequest
{
    [JsonPropertyName("id")]
    public string Id { get; init; }
}
