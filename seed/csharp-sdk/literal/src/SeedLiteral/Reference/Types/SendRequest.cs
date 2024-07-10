using System.Text.Json.Serialization;

#nullable enable

namespace SeedLiteral;

public record SendRequest
{
    [JsonPropertyName("prompt")]
    public required string Prompt { get; init; }

    [JsonPropertyName("query")]
    public required string Query { get; init; }

    [JsonPropertyName("stream")]
    public required bool Stream { get; init; }
}
