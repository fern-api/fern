using System.Text.Json.Serialization;

namespace Client.Types;

public class ObjectWithMapOfMap
{
    [JsonPropertyName("map")]
    public Dictionary<string, Dictionary<string, string>> Map { get; init; }
}
