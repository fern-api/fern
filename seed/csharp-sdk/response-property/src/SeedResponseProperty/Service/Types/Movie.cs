using System.Text.Json.Serialization;
using SeedResponseProperty.Core;

namespace SeedResponseProperty;

public record Movie
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
