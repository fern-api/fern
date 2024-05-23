using System.Text.Json.Serialization;

namespace SeedLiteral;

public class SendLiteralsInlinedRequest
{
    [JsonPropertyName("prompt")]
    public string Prompt { get; init; }

    [JsonPropertyName("query")]
    public string Query { get; init; }

    [JsonPropertyName("temperature")]
    public double? Temperature { get; init; }

    [JsonPropertyName("stream")]
    public bool Stream { get; init; }
}
