using System.Text.Json.Serialization;
using SeedExtends.Core;

namespace SeedExtends;

public record Inlined
{
    [JsonPropertyName("unique")]
    public required string Unique { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("docs")]
    public required string Docs { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
