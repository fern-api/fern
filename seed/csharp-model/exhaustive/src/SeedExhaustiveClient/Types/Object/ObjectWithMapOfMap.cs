using System.Text.Json.Serialization;

namespace SeedExhaustiveClient.Types;

public class ObjectWithMapOfMap
{
    [JsonPropertyName("map")]
    public Dictionary<string, Dictionary<string, string>> Map { get; init; }
}
