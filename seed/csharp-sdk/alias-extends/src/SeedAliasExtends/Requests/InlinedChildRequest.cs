using System.Text.Json.Serialization;

#nullable enable

namespace SeedAliasExtends;

public record InlinedChildRequest
{
    [JsonPropertyName("child")]
    public required string Child { get; set; }

    [JsonPropertyName("parent")]
    public required string Parent { get; set; }
}
