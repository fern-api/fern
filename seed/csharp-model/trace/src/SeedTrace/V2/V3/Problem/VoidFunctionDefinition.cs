using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2.V3;

[Serializable]
public record VoidFunctionDefinition
{
    [JsonPropertyName("parameters")]
    public IEnumerable<Parameter> Parameters { get; set; } = new List<Parameter>();

    [JsonPropertyName("code")]
    public required FunctionImplementationForMultipleLanguages Code { get; set; }

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
