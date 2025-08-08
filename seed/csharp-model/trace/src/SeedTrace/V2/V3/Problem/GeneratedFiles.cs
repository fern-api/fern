using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2.V3;

[Serializable]
public record GeneratedFiles : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("generatedTestCaseFiles")]
    public Dictionary<Language, Files> GeneratedTestCaseFiles { get; set; } =
        new Dictionary<Language, Files>();

    [JsonPropertyName("generatedTemplateFiles")]
    public Dictionary<Language, Files> GeneratedTemplateFiles { get; set; } =
        new Dictionary<Language, Files>();

    [JsonPropertyName("other")]
    public Dictionary<Language, Files> Other { get; set; } = new Dictionary<Language, Files>();

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
