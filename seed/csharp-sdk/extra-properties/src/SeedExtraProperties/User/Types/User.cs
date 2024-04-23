using System.Text.Json.Serialization;

namespace SeedExtraProperties;

public class User
{
    [JsonPropertyName("name")]
    public string Name { get; init; }
}
