using System.Text.Json.Serialization;

#nullable enable

namespace SeedLiteral;

public record SendLiteralsInlinedRequest
{
    [JsonPropertyName("prompt")]
    public required string Prompt { get; }

    [JsonPropertyName("query")]
    public required string Query { get; }

    [JsonPropertyName("temperature")]
    public double? Temperature { get; }

    [JsonPropertyName("stream")]
    public required bool Stream { get; }
}
