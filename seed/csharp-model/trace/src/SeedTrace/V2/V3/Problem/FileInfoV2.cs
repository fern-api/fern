using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace.V2.V3;

public record FileInfoV2
{
    [JsonPropertyName("filename")]
    public required string Filename { get; }

    [JsonPropertyName("directory")]
    public required string Directory { get; }

    [JsonPropertyName("contents")]
    public required string Contents { get; }

    [JsonPropertyName("editable")]
    public required bool Editable { get; }
}
