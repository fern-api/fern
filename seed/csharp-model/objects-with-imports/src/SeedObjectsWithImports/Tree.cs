using System.Text.Json.Serialization;
using SeedObjectsWithImports;

#nullable enable

namespace SeedObjectsWithImports;

public record Tree
{
    [JsonPropertyName("nodes")]
    public IEnumerable<Node>? Nodes { get; set; }
}
