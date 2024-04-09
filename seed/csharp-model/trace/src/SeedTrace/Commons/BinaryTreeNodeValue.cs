using System.Text.Json.Serialization;

namespace SeedTrace;

public class BinaryTreeNodeValue
{
    [JsonPropertyName("nodeId")]
    public string NodeId { get; init; }

    [JsonPropertyName("val")]
    public double Val { get; init; }

    [JsonPropertyName("right")]
    public List<string?> Right { get; init; }

    [JsonPropertyName("left")]
    public List<string?> Left { get; init; }
}
