using System.Text.Json;
using System.Text.Json.Serialization;
using SeedObjectsWithImports.Core;

namespace SeedObjectsWithImports;

public record File
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("contents")]
    public required string Contents { get; set; }

    [JsonPropertyName("info")]
    public required FileInfo Info { get; set; }

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
