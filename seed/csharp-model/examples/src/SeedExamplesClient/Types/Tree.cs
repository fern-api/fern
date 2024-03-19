using System.Text.Json.Serialization
using SeedExamplesClient

namespace SeedExamplesClient

public class Tree
{
    [JsonPropertyName("nodes")]
    public List<Node>? Nodes { get; init; }
}
