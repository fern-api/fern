using System.Text.Json.Serialization;

namespace Client;

public class Bar
{
    [JsonPropertyName("name")]
    public string Name { get; init; }
}
