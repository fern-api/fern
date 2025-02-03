using System.Text.Json.Serialization;
using SeedExamples.Core;

namespace SeedExamples;

public record StuntDouble
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("actorOrActressId")]
    public required string ActorOrActressId { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
