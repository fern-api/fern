using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record FileInfo
{
    [JsonPropertyName("filename")]
    public required string Filename { get; set; }

    [JsonPropertyName("contents")]
    public required string Contents { get; set; }
}
