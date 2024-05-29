using System.Text.Json.Serialization;

#nullable enable

namespace SeedExamples;

public class File
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("contents")]
    public string Contents { get; init; }
}
