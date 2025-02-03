using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record BinaryTreeValue
{
    [JsonPropertyName("root")]
    public string? Root { get; set; }

    [JsonPropertyName("nodes")]
    public Dictionary<string, BinaryTreeNodeValue> Nodes { get; set; } =
        new Dictionary<string, BinaryTreeNodeValue>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
