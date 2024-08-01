using System.Text.Json.Serialization;

#nullable enable

namespace SeedAliasExtends;

public record Child
{
    [JsonPropertyName("child")]
    public required string Child_ { get; set; }

    [JsonPropertyName("parent")]
    public required string Parent { get; set; }
}
