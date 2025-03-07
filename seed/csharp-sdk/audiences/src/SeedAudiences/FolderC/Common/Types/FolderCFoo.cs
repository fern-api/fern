using System.Text.Json;
using System.Text.Json.Serialization;
using SeedAudiences.Core;

namespace SeedAudiences.FolderC;

public record FolderCFoo
{
    [JsonPropertyName("bar_property")]
    public required string BarProperty { get; set; }

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
