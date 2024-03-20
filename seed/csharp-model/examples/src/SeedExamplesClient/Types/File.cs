using System.Text.Json.Serialization;

namespace SeedExamplesClient;

public class File
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("contents")]
    public string Contents { get; init; }
}
