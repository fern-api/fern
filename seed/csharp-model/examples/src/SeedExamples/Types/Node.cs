using System.Text.Json;
using System.Text.Json.Serialization;
using SeedExamples.Core;

namespace SeedExamples;

public record Node
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("nodes")]
    public IEnumerable<Node>? Nodes { get; set; }

    [JsonPropertyName("trees")]
    public IEnumerable<Tree>? Trees { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties =
        new Dictionary<string, JsonElement>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
