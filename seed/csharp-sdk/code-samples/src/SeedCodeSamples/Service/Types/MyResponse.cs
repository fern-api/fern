using System.Text.Json.Serialization;

#nullable enable

namespace SeedCodeSamples;

public class MyResponse
{
    [JsonPropertyName("id")]
    public string Id { get; init; }

    [JsonPropertyName("name")]
    public string? Name { get; init; }
}
