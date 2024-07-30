using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record TracedFile
{
    [JsonPropertyName("filename")]
    public required string Filename { get; set; }

    [JsonPropertyName("directory")]
    public required string Directory { get; set; }
}
