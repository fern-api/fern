using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record BinaryTreeNodeAndTreeValue
{
    [JsonPropertyName("nodeId")]
    public required string NodeId { get; init; }

    [JsonPropertyName("fullTree")]
    public required BinaryTreeValue FullTree { get; init; }
}
