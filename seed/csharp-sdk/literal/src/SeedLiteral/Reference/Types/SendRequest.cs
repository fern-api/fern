using System.Text.Json.Serialization;

namespace SeedLiteral;

public class SendRequest
{
    [JsonPropertyName("prompt")]
    public List<string> Prompt { get; init; }

    [JsonPropertyName("query")]
    public string Query { get; init; }

    [JsonPropertyName("stream")]
    public List<bool> Stream { get; init; }
}
