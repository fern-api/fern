using System.Text.Json;
using System.Text.Json.Serialization;
using SeedExtends.Core;

namespace SeedExtends;

public record NestedType
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("raw")]
    public required string Raw { get; set; }

    [JsonPropertyName("docs")]
    public required string Docs { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
