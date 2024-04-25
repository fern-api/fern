using System.Text.Json.Serialization;

namespace SeedExhaustive.Types;

public class ObjectWithMapOfMap
{
    [JsonPropertyName("map")]
    public List<Dictionary<string, List<Dictionary<string, string>>>> Map { get; init; }
}
