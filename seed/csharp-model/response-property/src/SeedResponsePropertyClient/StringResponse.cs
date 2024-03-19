using System.Text.Json.Serialization

namespace SeedResponsePropertyClient

public class StringResponse
{
    [JsonPropertyName("data")]
    public string Data { get; init; }
}
