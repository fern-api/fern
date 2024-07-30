using System.Text.Json.Serialization;
using SeedExamples;

#nullable enable

namespace SeedExamples;

public record Tree
{
    [JsonPropertyName("nodes")]
    public IEnumerable<Node>? Nodes { get; set; }
}
