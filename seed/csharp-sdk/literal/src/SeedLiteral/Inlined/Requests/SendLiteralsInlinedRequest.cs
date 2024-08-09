using System.Text.Json.Serialization;

#nullable enable

namespace SeedLiteral;

public record SendLiteralsInlinedRequest
{
    [JsonPropertyName("prompt")]
    public required string Prompt { get; set; }

    [JsonPropertyName("context")]
    public string? Context { get; set; }

    [JsonPropertyName("query")]
    public required string Query { get; set; }

    [JsonPropertyName("temperature")]
    public double? Temperature { get; set; }

    [JsonPropertyName("stream")]
    public required bool Stream { get; set; }

    [JsonPropertyName("aliasedContext")]
    public required string AliasedContext { get; set; }

    [JsonPropertyName("maybeContext")]
    public string? MaybeContext { get; set; }
}
