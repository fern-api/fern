using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class BinaryTreeValue
{
    [JsonPropertyName("root")]
    public List<string?> Root { get; init; }

    [JsonPropertyName("nodes")]
    public List<Dictionary<string, BinaryTreeNodeValue>> Nodes { get; init; }
}
