using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record TracedFile
{
    [JsonPropertyName("filename")]
    public required string Filename { get; set; }

    [JsonPropertyName("directory")]
    public required string Directory { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
