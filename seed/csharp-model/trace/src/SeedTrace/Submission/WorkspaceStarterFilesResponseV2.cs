using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;
using SeedTrace.V2;

namespace SeedTrace;

[Serializable]
public record WorkspaceStarterFilesResponseV2 : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("filesByLanguage")]
    public Dictionary<Language, Files> FilesByLanguage { get; set; } =
        new Dictionary<Language, Files>();

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
