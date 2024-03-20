using System.Text.Json.Serialization;

namespace SeedExtendsClient;

public class NestedType
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("raw")]
    public string Raw { get; init; }

    [JsonPropertyName("docs")]
    public string Docs { get; init; }
}
