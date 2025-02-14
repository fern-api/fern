using System.Text.Json.Serialization;
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

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
