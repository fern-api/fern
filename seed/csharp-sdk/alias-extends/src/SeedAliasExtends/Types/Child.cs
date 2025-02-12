using System.Text.Json.Serialization;
using SeedAliasExtends.Core;

namespace SeedAliasExtends;

public record Child
{
    [JsonPropertyName("child")]
    public required string Child_ { get; set; }

    [JsonPropertyName("parent")]
    public required string Parent { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
