using System.Text.Json.Serialization;
using SeedTraceClient;

namespace SeedTraceClient;

public class BinaryTreeNodeAndTreeValue
{
    [JsonPropertyName("nodeId")]
    public string NodeId { get; init; }

    [JsonPropertyName("fullTree")]
    public BinaryTreeValue FullTree { get; init; }
}
