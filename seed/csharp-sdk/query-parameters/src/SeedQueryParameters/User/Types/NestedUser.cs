using System.Text.Json.Serialization;
using SeedQueryParameters;

namespace SeedQueryParameters;

public class NestedUser
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("user")]
    public User User { get; init; }
}
