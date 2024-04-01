using System.Text.Json.Serialization;

namespace Client;

public class StringResponse
{
    [JsonPropertyName("data")]
    public string Data { get; init; }
}
