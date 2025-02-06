using System.Text.Json.Serialization;
using SeedAlias.Core;

namespace SeedAlias;

public record Type
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
