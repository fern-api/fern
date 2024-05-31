using System.Text.Json.Serialization;
using SeedObjectsWithImports;

#nullable enable

namespace SeedObjectsWithImports;

public class Tree
{
    [JsonPropertyName("nodes")]
    public IEnumerable<Node>? Nodes { get; init; }
}
