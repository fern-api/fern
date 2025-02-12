using System.Text.Json.Serialization;
using SeedPackageYml.Core;

namespace SeedPackageYml;

public record EchoRequest
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("size")]
    public required int Size { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
