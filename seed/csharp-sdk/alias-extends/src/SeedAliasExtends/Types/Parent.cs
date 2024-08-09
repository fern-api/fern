using System.Text.Json.Serialization;

#nullable enable

namespace SeedAliasExtends;

public record Parent
{
    [JsonPropertyName("parent")]
    public required string Parent_ { get; set; }
}
