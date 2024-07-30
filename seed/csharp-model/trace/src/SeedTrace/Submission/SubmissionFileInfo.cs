using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record SubmissionFileInfo
{
    [JsonPropertyName("directory")]
    public required string Directory { get; set; }

    [JsonPropertyName("filename")]
    public required string Filename { get; set; }

    [JsonPropertyName("contents")]
    public required string Contents { get; set; }
}
