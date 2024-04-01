using System.Text.Json.Serialization;

namespace SeedResponseProperty;

public class StringResponse
{
    [JsonPropertyName("data")]
    public string Data { get; init; }
}
