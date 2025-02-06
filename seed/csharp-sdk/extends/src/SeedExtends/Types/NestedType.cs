using System.Text.Json.Serialization;
using SeedExtends.Core;

namespace SeedExtends;

public record NestedType
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("raw")]
    public required string Raw { get; set; }

    [JsonPropertyName("docs")]
    public required string Docs { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
