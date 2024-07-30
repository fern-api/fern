using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record BinaryTreeNodeAndTreeValue
{
    [JsonPropertyName("nodeId")]
    public required string NodeId { get; }

    [JsonPropertyName("fullTree")]
    public required BinaryTreeValue FullTree { get; }
}
