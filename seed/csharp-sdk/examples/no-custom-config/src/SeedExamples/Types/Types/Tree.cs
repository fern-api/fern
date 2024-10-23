using System.Text.Json.Serialization;
using SeedExamples.Core;

#nullable enable

namespace SeedExamples;

public record Tree
{
    [JsonPropertyName("nodes")]
    public IEnumerable<Node>? Nodes { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
