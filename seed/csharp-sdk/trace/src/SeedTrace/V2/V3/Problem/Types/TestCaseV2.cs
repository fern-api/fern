using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2.V3;

[Serializable]
public record TestCaseV2 : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("metadata")]
    public required TestCaseMetadata Metadata { get; set; }

    [JsonPropertyName("implementation")]
    public required TestCaseImplementationReference Implementation { get; set; }

    [JsonPropertyName("arguments")]
    public Dictionary<string, VariableValue> Arguments { get; set; } =
        new Dictionary<string, VariableValue>();

    [JsonPropertyName("expects")]
    public TestCaseExpects? Expects { get; set; }

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
