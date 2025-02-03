using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record SubmissionFileInfo
{
    [JsonPropertyName("directory")]
    public required string Directory { get; set; }

    [JsonPropertyName("filename")]
    public required string Filename { get; set; }

    [JsonPropertyName("contents")]
    public required string Contents { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
