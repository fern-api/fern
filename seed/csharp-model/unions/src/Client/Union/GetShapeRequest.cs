using System.Text.Json.Serialization;

namespace Client;

public class GetShapeRequest
{
    [JsonPropertyName("id")]
    public string Id { get; init; }
}
