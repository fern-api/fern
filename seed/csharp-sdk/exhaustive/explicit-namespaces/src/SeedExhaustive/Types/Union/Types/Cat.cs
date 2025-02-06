using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Types.Union;

public record Cat
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("likesToMeow")]
    public required bool LikesToMeow { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
