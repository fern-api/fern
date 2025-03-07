using System.Text.Json;
using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Types;

public record DoubleOptional
{
    [JsonPropertyName("optionalAlias")]
    public string? OptionalAlias { get; set; }

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
