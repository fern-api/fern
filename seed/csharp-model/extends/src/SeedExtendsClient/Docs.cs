using System.Text.Json.Serialization;

namespace SeedExtendsClient;

public class Docs
{
    [JsonPropertyName("docs")]
    public string Docs { get; init; }
}
