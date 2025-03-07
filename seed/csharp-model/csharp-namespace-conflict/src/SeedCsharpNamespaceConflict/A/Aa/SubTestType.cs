using System.Text.Json;
using System.Text.Json.Serialization;
using SeedCsharpNamespaceConflict.Core;

namespace SeedCsharpNamespaceConflict.A.Aa;

public record SubTestType
{
    [JsonPropertyName("a")]
    public required A A { get; set; }

    [JsonPropertyName("b")]
    public required B B { get; set; }

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
