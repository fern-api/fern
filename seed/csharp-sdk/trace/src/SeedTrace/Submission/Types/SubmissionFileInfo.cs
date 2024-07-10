using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record SubmissionFileInfo
{
    [JsonPropertyName("directory")]
    public required string Directory { get; init; }

    [JsonPropertyName("filename")]
    public required string Filename { get; init; }

    [JsonPropertyName("contents")]
    public required string Contents { get; init; }
}
