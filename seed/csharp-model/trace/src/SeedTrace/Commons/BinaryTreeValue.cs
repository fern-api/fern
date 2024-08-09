using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record BinaryTreeValue
{
    [JsonPropertyName("root")]
    public string? Root { get; set; }

    [JsonPropertyName("nodes")]
    public Dictionary<string, BinaryTreeNodeValue> Nodes { get; set; } =
        new Dictionary<string, BinaryTreeNodeValue>();
}
