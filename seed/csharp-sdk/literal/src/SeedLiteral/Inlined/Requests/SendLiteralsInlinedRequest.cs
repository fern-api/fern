using System.Text.Json;
using System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

public record SendLiteralsInlinedRequest
{
    [JsonPropertyName("prompt")]
    public string Prompt { get; set; } = "You are a helpful assistant";

    [JsonPropertyName("context")]
    public string? Context { get; set; }

    [JsonPropertyName("query")]
    public required string Query { get; set; }

    [JsonPropertyName("temperature")]
    public double? Temperature { get; set; }

    [JsonPropertyName("stream")]
    public bool Stream { get; set; } = false;

    [JsonPropertyName("aliasedContext")]
    public string AliasedContext { get; set; } = "You're super wise";

    [JsonPropertyName("maybeContext")]
    public string? MaybeContext { get; set; }

    [JsonPropertyName("objectWithLiteral")]
    public required ATopLevelLiteral ObjectWithLiteral { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
