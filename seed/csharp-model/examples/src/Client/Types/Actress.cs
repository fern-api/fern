using System.Text.Json.Serialization;

namespace Client;

public class Actress
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("id")]
    public string Id { get; init; }
}
