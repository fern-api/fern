using System.Text.Json;
using System.Text.Json.Serialization;
using SeedExtends.Core;

namespace SeedExtends;

public record ExampleType
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("docs")]
    public required string Docs { get; set; }

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
