using System.Text.Json.Serialization;

namespace SeedMixedCase;

public class Organization
{
    [JsonPropertyName("name")]
    public string Name { get; init; }
}
