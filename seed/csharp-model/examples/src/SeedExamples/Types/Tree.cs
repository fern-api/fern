using System.Text.Json.Serialization;
using SeedExamples;

#nullable enable

namespace SeedExamples;

public class Tree
{
    [JsonPropertyName("nodes")]
    public IEnumerable<Node>? Nodes { get; init; }
}
