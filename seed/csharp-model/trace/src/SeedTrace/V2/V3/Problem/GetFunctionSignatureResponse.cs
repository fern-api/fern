using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.V2.V3;

public record GetFunctionSignatureResponse
{
    [JsonPropertyName("functionByLanguage")]
    public Dictionary<Language, string> FunctionByLanguage { get; set; } =
        new Dictionary<Language, string>();

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
