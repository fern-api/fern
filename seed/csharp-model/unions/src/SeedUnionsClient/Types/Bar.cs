using System.Text.Json.Serialization

namespace SeedUnionsClient

public class Bar
{
    [JsonPropertyName("name")]
    public string Name { get; init; }
}
