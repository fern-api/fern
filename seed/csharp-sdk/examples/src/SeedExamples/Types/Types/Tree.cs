using System.Text.Json.Serialization;
using SeedExamples;

namespace SeedExamples;

public class Tree
{
    [JsonPropertyName("nodes")]
    public List<List<List<Node>>?> Nodes { get; init; }
}
