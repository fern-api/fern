using System.Text.Json.Serialization;

namespace SeedUnionsClient;

public class GetShapeRequest
{
    [JsonPropertyName("id")]
    public string Id { get; init; }
}
