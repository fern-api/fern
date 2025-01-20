using System.Text.Json.Serialization;
using SeedLiteral.Core;

#nullable enable

namespace SeedLiteral;

public record SendRequest
{
    [JsonPropertyName("prompt")]
    public required string Prompt { get; set; }

    [JsonPropertyName("query")]
    public required string Query { get; set; }

    [JsonPropertyName("stream")]
    public required bool Stream { get; set; }

    [JsonPropertyName("ending")]
    public required string Ending { get; set; }

    [JsonPropertyName("context")]
    public required string Context { get; set; }

    [JsonPropertyName("maybeContext")]
    public string? MaybeContext { get; set; }

    [JsonPropertyName("containerObject")]
    public required ContainerObject ContainerObject { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
