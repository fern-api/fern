using System.Text.Json.Serialization

namespace SeedTraceClient

public class BinaryTreeNodeValue
{
    [JsonPropertyName("nodeId")]
    public string NodeId { get; init; }

    [JsonPropertyName("val")]
    public double Val { get; init; }

    [JsonPropertyName("right")]
    public string? Right { get; init; }

    [JsonPropertyName("left")]
    public string? Left { get; init; }
}
