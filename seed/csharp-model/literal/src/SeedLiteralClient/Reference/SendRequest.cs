using System.Text.Json.Serialization

namespace SeedLiteralClient

public class SendRequest
{
    [JsonPropertyName("prompt")]
    public string Prompt { get; init; }
    [JsonPropertyName("query")]
    public string Query { get; init; }
    [JsonPropertyName("stream")]
    public bool Stream { get; init; }
}
