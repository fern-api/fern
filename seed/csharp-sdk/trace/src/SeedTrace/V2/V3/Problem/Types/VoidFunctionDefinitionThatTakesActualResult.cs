using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2.V3;

/// <summary>
/// The generated signature will include an additional param, actualResult
/// </summary>
[Serializable]
public record VoidFunctionDefinitionThatTakesActualResult : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("additionalParameters")]
    public IEnumerable<Parameter> AdditionalParameters { get; set; } = new List<Parameter>();

    [JsonPropertyName("code")]
    public required FunctionImplementationForMultipleLanguages Code { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
