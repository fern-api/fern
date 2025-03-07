using System.Text.Json;
using System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

public record ContainerObject
{
    [JsonPropertyName("nestedObjects")]
    public IEnumerable<NestedObjectWithLiterals> NestedObjects { get; set; } =
        new List<NestedObjectWithLiterals>();

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
