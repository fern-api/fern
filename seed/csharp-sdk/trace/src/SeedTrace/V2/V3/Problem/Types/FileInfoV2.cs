using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2.V3;

public record FileInfoV2
{
    [JsonPropertyName("filename")]
    public required string Filename { get; set; }

    [JsonPropertyName("directory")]
    public required string Directory { get; set; }

    [JsonPropertyName("contents")]
    public required string Contents { get; set; }

    [JsonPropertyName("editable")]
    public required bool Editable { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
