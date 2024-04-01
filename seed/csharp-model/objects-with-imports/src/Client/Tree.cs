using System.Text.Json.Serialization;
using Client;

namespace Client;

public class Tree
{
    [JsonPropertyName("nodes")]
    public List<Node>? Nodes { get; init; }
}
