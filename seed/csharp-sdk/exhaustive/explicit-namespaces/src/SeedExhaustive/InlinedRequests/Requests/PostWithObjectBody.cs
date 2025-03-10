using System.Text.Json;
using System.Text.Json.Serialization;
using SeedExhaustive.Core;
using SeedExhaustive.Types.Object;

namespace SeedExhaustive.InlinedRequests;

public record PostWithObjectBody
{
    [JsonPropertyName("string")]
    public required string String { get; set; }

    [JsonPropertyName("integer")]
    public required int Integer { get; set; }

    [JsonPropertyName("NestedObject")]
    public required ObjectWithOptionalField NestedObject { get; set; }

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
