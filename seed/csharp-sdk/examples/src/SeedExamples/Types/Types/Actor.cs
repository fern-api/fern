using System.Text.Json.Serialization;

#nullable enable

namespace SeedExamples;

public class Actor
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("id")]
    public string Id { get; init; }
}
