using System.Text.Json;
using System.Text.Json.Serialization;
using SeedCrossPackageTypeNames;
using SeedCrossPackageTypeNames.Core;
using SeedCrossPackageTypeNames.FolderB;

namespace SeedCrossPackageTypeNames.FolderA;

[Serializable]
public record Response : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("foo")]
    public Foo? Foo { get; set; }

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
