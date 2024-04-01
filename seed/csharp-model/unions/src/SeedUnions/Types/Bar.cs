using System.Text.Json.Serialization;

namespace SeedUnions;

public class Bar
{
    [JsonPropertyName("name")]
    public string Name { get; init; }
}
