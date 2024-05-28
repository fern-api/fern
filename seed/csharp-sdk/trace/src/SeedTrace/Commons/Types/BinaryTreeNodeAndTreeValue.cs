using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public class BinaryTreeNodeAndTreeValue
{
    [JsonPropertyName("nodeId")]
    public string NodeId { get; init; }

    [JsonPropertyName("fullTree")]
    public BinaryTreeValue FullTree { get; init; }
}
