using System.Text.Json.Serialization;

namespace SeedResponseProperty;

public class WithDocs
{
    [JsonPropertyName("docs")]
    public string Docs { get; init; }
}
