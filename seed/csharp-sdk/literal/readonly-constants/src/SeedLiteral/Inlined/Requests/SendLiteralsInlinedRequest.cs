using System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

[Serializable]
public record SendLiteralsInlinedRequest
{
    [JsonPropertyName("prompt")]
    public string Prompt
    {
        get => "You are a helpful assistant";
        set =>
            value.Assert(
                value == "You are a helpful assistant",
                string.Format("'Prompt' must be {0}", "You are a helpful assistant")
            );
    }

    [JsonPropertyName("context")]
    public string? Context { get; set; }

    [JsonPropertyName("query")]
    public required string Query { get; set; }

    [JsonPropertyName("temperature")]
    public double? Temperature { get; set; }

    [JsonPropertyName("stream")]
    public bool Stream
    {
        get => false;
        set => value.Assert(value == false, string.Format("'Stream' must be {0}", false));
    }

    [JsonPropertyName("aliasedContext")]
    public string AliasedContext
    {
        get => "You're super wise";
        set =>
            value.Assert(
                value == "You're super wise",
                string.Format("'AliasedContext' must be {0}", "You're super wise")
            );
    }

    [JsonPropertyName("maybeContext")]
    public string? MaybeContext { get; set; }

    [JsonPropertyName("objectWithLiteral")]
    public required ATopLevelLiteral ObjectWithLiteral { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
