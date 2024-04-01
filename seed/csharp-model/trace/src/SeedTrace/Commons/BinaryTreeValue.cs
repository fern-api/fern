using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class BinaryTreeValue
{
    [JsonPropertyName("root")]
    public string? Root { get; init; }

    [JsonPropertyName("nodes")]
    public Dictionary<string, BinaryTreeNodeValue> Nodes { get; init; }
}
