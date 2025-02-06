using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record BinaryTreeNodeValue
{
    [JsonPropertyName("nodeId")]
    public required string NodeId { get; set; }

    [JsonPropertyName("val")]
    public required double Val { get; set; }

    [JsonPropertyName("right")]
    public string? Right { get; set; }

    [JsonPropertyName("left")]
    public string? Left { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
