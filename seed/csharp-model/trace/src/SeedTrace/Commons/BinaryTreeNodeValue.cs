using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record BinaryTreeNodeValue
{
    [JsonPropertyName("nodeId")]
    public required string NodeId { get; }

    [JsonPropertyName("val")]
    public required double Val { get; }

    [JsonPropertyName("right")]
    public string? Right { get; }

    [JsonPropertyName("left")]
    public string? Left { get; }
}
