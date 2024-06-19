using System.Text.Json.Serialization;

#nullable enable

namespace SeedMixedCase;

public class Organization
{
    [JsonPropertyName("name")]
    public string Name { get; init; }
}
