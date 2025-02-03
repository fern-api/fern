using System.Text.Json.Serialization;
using SeedExamples.Core;

namespace SeedExamples;

public record File
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("contents")]
    public required string Contents { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
