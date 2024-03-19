using System.Text.Json.Serialization

namespace SeedResponsePropertyClient

public class WithDocs
{
    [JsonPropertyName("docs")]
    public string Docs { get; init; }
}
