using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record InlinedSendRequest
{
    [JsonPropertyName("prompt")]
    public required InlinedSendRequestPrompt Prompt { get; set; }

    [JsonPropertyName("context")]
    public InlinedSendRequestContext? Context { get; set; }

    [JsonPropertyName("query")]
    public required string Query { get; set; }

    [JsonPropertyName("temperature")]
    public double? Temperature { get; set; }

    [JsonPropertyName("stream")]
    public required bool Stream { get; set; }

    [JsonPropertyName("aliasedContext")]
    public required SomeAliasedLiteral AliasedContext { get; set; }

    [JsonPropertyName("maybeContext")]
    public SomeAliasedLiteral? MaybeContext { get; set; }

    [JsonPropertyName("objectWithLiteral")]
    public required ATopLevelLiteral ObjectWithLiteral { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
