using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Types;

public record ObjectWithMapOfMap
{
    [JsonPropertyName("map")]
    public Dictionary<string, Dictionary<string, string>> Map { get; set; } =
        new Dictionary<string, Dictionary<string, string>>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
