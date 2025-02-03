using System.Text.Json.Serialization;
using SeedExamples.Core;

namespace SeedExamples;

public record Actress
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("id")]
    public required string Id { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
