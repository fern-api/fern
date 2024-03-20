using System.Text.Json.Serialization;
using SeedQueryParametersClient;

namespace SeedQueryParametersClient;

public class NestedUser
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("user")]
    public User User { get; init; }
}
