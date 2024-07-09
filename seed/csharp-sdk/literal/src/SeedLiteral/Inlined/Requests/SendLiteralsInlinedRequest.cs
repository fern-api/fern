using System.Text.Json.Serialization;

#nullable enable

namespace SeedLiteral;

public record SendLiteralsInlinedRequest
{
    [JsonPropertyName("prompt")]
    public required string Prompt { get; init; }

    [JsonPropertyName("query")]
    public required string Query { get; init; }

    [JsonPropertyName("temperature")]
    public double? Temperature { get; init; }

    [JsonPropertyName("stream")]
    public required bool Stream { get; init; }
}
