using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.V2;

[Serializable]
public record GetFunctionSignatureResponse
{
    [JsonPropertyName("functionByLanguage")]
    public Dictionary<Language, string> FunctionByLanguage { get; set; } =
        new Dictionary<Language, string>();

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    /// <remarks>
    /// [EXPERIMENTAL] This API is experimental and may change in future releases.
    /// </remarks>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
