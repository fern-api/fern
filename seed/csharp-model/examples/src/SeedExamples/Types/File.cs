using System.Text.Json.Serialization;

namespace SeedExamples;

public class File
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("contents")]
    public string Contents { get; init; }
}
