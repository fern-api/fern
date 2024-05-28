using System.Text.Json.Serialization;
using SeedExamples;

#nullable enable

namespace SeedExamples;

public class Tree
{
    [JsonPropertyName("nodes")]
    public List<Node>? Nodes { get; init; }
}
