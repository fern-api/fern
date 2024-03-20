using System.Text.Json.Serialization;
using SeedObjectsWithImportsClient;

namespace SeedObjectsWithImportsClient;

public class Tree
{
    [JsonPropertyName("nodes")]
    public List<Node>? Nodes { get; init; }
}
