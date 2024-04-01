using System.Text.Json.Serialization;

namespace Client;

public class Actor
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("id")]
    public string Id { get; init; }
}
