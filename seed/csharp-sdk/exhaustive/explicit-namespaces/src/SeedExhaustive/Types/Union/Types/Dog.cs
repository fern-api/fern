using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Types.Union;

public record Dog
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("likesToWoof")]
    public required bool LikesToWoof { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
