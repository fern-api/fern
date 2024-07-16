using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace.V2.V3;

public record FileInfoV2
{
    [JsonPropertyName("filename")]
    public required string Filename { get; init; }

    [JsonPropertyName("directory")]
    public required string Directory { get; init; }

    [JsonPropertyName("contents")]
    public required string Contents { get; init; }

    [JsonPropertyName("editable")]
    public required bool Editable { get; init; }
}
