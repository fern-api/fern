using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record BinaryTreeNodeAndTreeValue
{
    [JsonPropertyName("nodeId")]
    public required string NodeId { get; set; }

    [JsonPropertyName("fullTree")]
    public required BinaryTreeValue FullTree { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
