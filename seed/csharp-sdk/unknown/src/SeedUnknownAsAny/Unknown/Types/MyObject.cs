using System.Text.Json;
using System.Text.Json.Serialization;
using SeedUnknownAsAny.Core;

namespace SeedUnknownAsAny;

public record MyObject
{
    [JsonPropertyName("unknown")]
    public required object Unknown { get; set; }

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
