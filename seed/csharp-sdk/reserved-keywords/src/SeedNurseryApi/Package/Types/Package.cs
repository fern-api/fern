using System.Text.Json.Serialization;

#nullable enable

namespace SeedNurseryApi;

public class Package
{
    [JsonPropertyName("name")]
    public string Name { get; init; }
}
