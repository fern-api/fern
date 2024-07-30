using System.Text.Json.Serialization;

#nullable enable

namespace SeedLiteral;

public record SendRequest
{
    [JsonPropertyName("prompt")]
    public required string Prompt { get; }

    [JsonPropertyName("query")]
    public required string Query { get; }

    [JsonPropertyName("stream")]
    public required bool Stream { get; }
}
