using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record SendRequest
{
    [JsonPropertyName("prompt")]
    public required SendRequestPrompt Prompt { get; set; }

    [JsonPropertyName("query")]
    public required string Query { get; set; }

    [JsonPropertyName("stream")]
    public required bool Stream { get; set; }

    [JsonPropertyName("ending")]
    public required SendRequestEnding Ending { get; set; }

    [JsonPropertyName("context")]
    public required SomeLiteral Context { get; set; }

    [JsonPropertyName("maybeContext")]
    public SomeLiteral? MaybeContext { get; set; }

    [JsonPropertyName("containerObject")]
    public required ContainerObject ContainerObject { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
