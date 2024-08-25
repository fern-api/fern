using System.Text.Json.Serialization;

#nullable enable

namespace SeedExhaustive.Types;

public record ObjectWithMapOfMap
{
    [JsonPropertyName("map")]
    public Dictionary<string, Dictionary<string, string>> Map { get; } =
        new Dictionary<string, Dictionary<string, string>>();
}
