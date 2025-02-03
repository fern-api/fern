using System.Text.Json.Serialization;
using SeedLiteral.Core;

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

    [JsonPropertyName("objectWithLiteral")]
    public required ATopLevelLiteral ObjectWithLiteral { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
