using System.Text.Json.Serialization;
using Client;

namespace Client;

public class NestedUser
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("user")]
    public User User { get; init; }
}
