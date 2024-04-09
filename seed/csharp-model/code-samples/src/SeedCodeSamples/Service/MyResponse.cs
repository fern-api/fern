using System.Text.Json.Serialization;

namespace SeedCodeSamples;

public class MyResponse
{
    [JsonPropertyName("id")]
    public string Id { get; init; }

    [JsonPropertyName("name")]
    public List<string?> Name { get; init; }
}
