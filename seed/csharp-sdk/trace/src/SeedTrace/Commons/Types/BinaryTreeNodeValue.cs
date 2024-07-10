using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record BinaryTreeNodeValue
{
    [JsonPropertyName("nodeId")]
    public required string NodeId { get; init; }

    [JsonPropertyName("val")]
    public required double Val { get; init; }

    [JsonPropertyName("right")]
    public string? Right { get; init; }

    [JsonPropertyName("left")]
    public string? Left { get; init; }
}
