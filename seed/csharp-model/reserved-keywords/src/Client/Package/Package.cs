using System.Text.Json.Serialization;

namespace Client;

public class Package
{
    [JsonPropertyName("name")]
    public string Name { get; init; }
}
