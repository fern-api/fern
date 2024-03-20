using System.Text.Json.Serialization

namespace SeedCodeSamplesClient

public class MyResponse
{
    [JsonPropertyName("id")]
    public string Id { get; init; }

    [JsonPropertyName("name")]
    public string? Name { get; init; }
}
