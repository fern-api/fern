using System.Text.Json.Serialization

namespace SeedNurseryApiClient

public class Package
{
    [JsonPropertyName("name")]
    public string Name { get; init; }
}
