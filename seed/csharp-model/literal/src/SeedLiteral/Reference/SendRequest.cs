using System.Text.Json.Serialization;
using System.Text.Json;
using SeedLiteral.Core;

namespace SeedLiteral;

public record SendRequest
{
    [JsonPropertyName("prompt")]
    public string Prompt { get; set; } = "You are a helpful assistant";

    [JsonPropertyName("query")]
    public required string Query { get; set; }

    [JsonPropertyName("stream")]
    public bool Stream { get; set; } = false;

    [JsonPropertyName("ending")]
    public string Ending { get; set; } = "$ending";

    [JsonPropertyName("context")]
    public string Context { get; set; } = "You're super wise";

    [JsonPropertyName("maybeContext")]
    public string? MaybeContext { get; set; }

    [JsonPropertyName("containerObject")]
    public required ContainerObject ContainerObject { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    /// <remarks>
    /// [EXPERIMENTAL] This API is experimental and may change in future releases.
    /// </remarks>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } = new Dictionary<string, JsonElement>();
    /// <inheritdoc />
    public override string ToString() {
        return JsonUtils.Serialize(this);
    }

}
