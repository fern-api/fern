using System.Text.Json.Serialization;
using SeedObjectsWithImports;

namespace SeedObjectsWithImports;

public class Tree
{
    [JsonPropertyName("nodes")]
    public List<List<List<Node>>?> Nodes { get; init; }
}
