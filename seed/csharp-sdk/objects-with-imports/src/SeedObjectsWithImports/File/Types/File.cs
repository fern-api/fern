using System.Text.Json.Serialization;
using SeedObjectsWithImports.Core;

namespace SeedObjectsWithImports;

public record File
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("contents")]
    public required string Contents { get; set; }

    [JsonPropertyName("info")]
    public required FileInfo Info { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
