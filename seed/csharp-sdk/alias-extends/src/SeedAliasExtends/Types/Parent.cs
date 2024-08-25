using System.Text.Json.Serialization;
using SeedAliasExtends.Core;

#nullable enable

namespace SeedAliasExtends;

public record Parent
{
    [JsonPropertyName("parent")]
    public required string Parent_ { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
