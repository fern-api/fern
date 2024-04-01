using System.Text.Json.Serialization;

namespace SeedNurseryApi;

public class Package
{
    [JsonPropertyName("name")]
    public string Name { get; init; }
}
