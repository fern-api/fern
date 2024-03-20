using System.Text.Json.Serialization

namespace SeedExtendsClient

public class Json
{
    [JsonPropertyName("raw")]
    public string Raw { get; init; }

    [JsonPropertyName("docs")]
    public string Docs { get; init; }
}
