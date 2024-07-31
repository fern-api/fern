using System.Text.Json.Serialization;

#nullable enable

namespace SeedExamples;

public record File
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("contents")]
    public required string Contents { get; set; }
}
