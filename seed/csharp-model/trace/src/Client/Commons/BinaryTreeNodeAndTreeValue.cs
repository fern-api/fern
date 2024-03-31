using System.Text.Json.Serialization;
using Client;

namespace Client;

public class BinaryTreeNodeAndTreeValue
{
    [JsonPropertyName("nodeId")]
    public string NodeId { get; init; }

    [JsonPropertyName("fullTree")]
    public BinaryTreeValue FullTree { get; init; }
}
