using System.Text.Json.Serialization;
using SeedExamples;

#nullable enable

namespace SeedExamples;

public class Node
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("nodes")]
    public IEnumerable<Node>? Nodes { get; init; }

    [JsonPropertyName("trees")]
    public IEnumerable<Tree>? Trees { get; init; }
}
