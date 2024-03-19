using System.Text.Json.Serialization

namespace SeedAliasClient

public class Type
{
    [JsonPropertyName("id")]
    public string Id { get; init; }
    [JsonPropertyName("name")]
    public string Name { get; init; }
}
