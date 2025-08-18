using System.Text.Json;
using System.Text.Json.Serialization;
using SeedExhaustive;
using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints.Put;

[System.Serializable]
public record PutResponse : System.Text.Json.Serialization.IJsonOnDeserialized
{
    [System.Text.Json.Serialization.JsonExtensionData]
    private readonly IDictionary<string, System.Text.Json.JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [System.Text.Json.Serialization.JsonPropertyName("errors")]
    public IEnumerable<SeedExhaustive.Endpoints.Put.Error>? Errors { get; set; }

    [System.Text.Json.Serialization.JsonIgnore]
    public SeedExhaustive.ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } =
        new();

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return SeedExhaustive.Core.JsonUtils.Serialize(this);
    }
}
